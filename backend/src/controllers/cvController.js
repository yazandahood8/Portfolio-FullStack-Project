import markdownIt from 'markdown-it';
import * as htmlPdf from 'html-pdf-node';
import fs from 'fs-extra';
import path from 'path';
import genAI from '../ai/gemini.js';
import userModel from '../models/userModel.js';
import skillModel from '../models/skillModel.js';
import experienceModel from '../models/experienceModel.js';
import projectModel from '../models/projectModel.js';
import educationModel from '../models/educationModel.js';
import volunteerModel from '../models/volunteeringModel.js';
import certificationModel from '../models/certificationModel.js';

// Helper: Retry Gemini AI calls if service overloaded (503)
async function callGeminiWithRetry(model, prompt, retries = 3, delayMs = 3500) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      if ((err.status === 503 || err.code === 503) && i < retries - 1) {
        console.warn('Gemini AI overloaded, retrying in', delayMs, 'ms...');
        await new Promise(res => setTimeout(res, delayMs));
        continue;
      }
      throw err;
    }
  }
}

// Directory for cached markdown CVs
const CACHE_DIR = path.resolve('ai-cv-cache');

// Ensure cache directory exists at server start
fs.ensureDirSync(CACHE_DIR);
export const regenerateCVAi = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const cachePath = path.join(CACHE_DIR, `${userId}.md`);
    // Delete cache file if exists
    if (await fs.pathExists(cachePath)) {
      await fs.remove(cachePath);
      console.log(`Cache cleared for user ${userId}`);
    }
    // Now call main getCVAi logic to generate fresh
    req.query.force = "1"; // Optionally set a flag
    return getCVAi(req, res, next); // Call main logic (if in same file/module)
  } catch (err) {
    next(err);
  }
};
export const getCVAi = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    if (!userId) return res.status(400).json({ success: false, message: 'Missing user ID.' });

    const cachePath = path.join(CACHE_DIR, `${userId}.md`);
    let markdown;

    // 1. Try to load cached markdown first
    if (await fs.pathExists(cachePath)) {
      markdown = await fs.readFile(cachePath, 'utf-8');
      console.log(`Loaded CV markdown for user ${userId} from cache.`);
    } else {
      // 2. Get user data for AI
      const user = await userModel.getById(userId);
      if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
      const skills = await skillModel.getAllByUser(userId);
      const experiences = await experienceModel.getAllByUser(userId);
      const projects = await projectModel.getAllByUser(userId);
      const educations = await educationModel.getAllByUser(userId);
      const socialLinks = await userModel.getSocialLinks(userId);
      const volunteerings = await volunteerModel.getAllByUser(userId);
      const certifications = await certificationModel.getAllByUser(userId);
      // 3. Compose prompt and call Gemini
      const cvJson = { user,socialLinks, skills, experiences, projects, educations, volunteerings, certifications };
      const prompt = `
You are an expert CV writer.  
Given the following user data as JSON, generate a perfect one-page resume in Markdown.  
• Be concise, well-structured, and use best practices for tech CVs.
• Format sections: Name, Contact, Bio, Education, Skills, Experience, Projects.
• Render dates as (YYYY-MM or "Present").
• Use bullet points for skills and projects.  
• Write in strong, professional English.
• replace the bio to summarize the user's background and skills.
• make it only in one page A4, so be concise.
User CV Data:
${JSON.stringify(cvJson, null, 2)}
`;

      const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const aiResult = await callGeminiWithRetry(geminiModel, prompt);

      // Normalize result to string (for Gemini 1.5+ SDK)
      if (
        typeof aiResult === "object" &&
        aiResult !== null &&
        aiResult.response &&
        typeof aiResult.response.text === "function"
      ) {
        markdown = await aiResult.response.text();
      } else if (typeof aiResult === "string") {
        markdown = aiResult;
      } else {
        markdown = "";
      }

      if (typeof markdown !== "string" || !markdown.trim()) {
        return res.status(500).json({
          success: false,
          message: "Gemini AI did not return valid Markdown.",
          debug: { aiResult }
        });
      }

      // 4. Save to cache for next time
      await fs.writeFile(cachePath, markdown, 'utf-8');
      console.log(`Saved CV markdown for user ${userId} to cache.`);
    }

    // 5. Get user info for filename (from cache, so may need to reload)
    const user = await userModel.getById(userId);

    // 6. Convert to HTML, then PDF, and stream to client
    const md = markdownIt({ html: true, linkify: true });
    const html = md.render(markdown);

    const file = { content: html };
    const options = { format: 'A4' };
    htmlPdf.generatePdf(file, options).then(pdfBuffer => {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${user.full_name.replace(/\s+/g, '_')}_AI_CV.pdf"`
      );
      res.end(pdfBuffer);
    }).catch(next);

    // Optionally: Return markdown or html as JSON for debugging:
    // res.json({ success: true, markdown, html });

  } catch (err) {
    next(err);
  }
};

// ---- Classic Manual PDF CV Endpoint ----
export const getCV = async (req, res, next) => {
  try {
    const { id: userId } = req.params;
    const user = await userModel.getById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const skills = await skillModel.getAllByUser(userId);
    const experiences = await experienceModel.getAllByUser(userId);
    const projects = await projectModel.getAllByUser(userId);
    const educations = await educationModel.getAllByUser(userId);
    const volunteerings = await volunteerModel.getAllByUser(userId);
    const certifications = await certificationModel.getAllByUser(userId);

    CreateCvPdf(res, user, skills, experiences, projects, educations, volunteerings, certifications);
  } catch (err) {
    next(err);
  }
};

// ---- Helper: Generate Classic PDF ----
function CreateCvPdf(res, user, skills, experiences, projects, educations, volunteerings, certifications) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${user.full_name.replace(/\s+/g, '_')}_CV.pdf"`
  );

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  // Title
  doc.fontSize(24).text(user.full_name, { align: 'center' }).moveDown(0.5);

  // Contact info
  doc.fontSize(10)
    .text(user.email, { align: 'center' })
    .text(user.phone || '', { align: 'center' })
    .text(user.location || '', { align: 'center' })
    .moveDown();

  // Bio
  if (user.bio) {
    doc.fontSize(12)
      .text('About', { underline: true })
      .moveDown(0.2)
      .fontSize(10)
      .text(user.bio)
      .moveDown();
  }

  // Education
  if (educations.length) {
    doc.fontSize(12)
      .text('Education', { underline: true })
      .moveDown(0.2)
      .fontSize(10);
    educations.forEach(edu => {
      const start = formatDate(edu.start_date);
      const end = edu.is_current ? 'Present' : formatDate(edu.end_date);
      doc.text(
        `${edu.degree} in ${edu.field_of_study || ''} at ${edu.school_name} (${start} – ${end})`
      );
    });
    doc.moveDown();
  }

  // Skills
  if (skills.length) {
    doc.fontSize(12)
      .text('Skills', { underline: true })
      .moveDown(0.2)
      .fontSize(10);
    skills.forEach(s => {
      doc.text(`• ${s.skill_name} (${s.level})`);
    });
    doc.moveDown();
  }

  // Experiences
  if (experiences.length) {
    doc.fontSize(12)
      .text('Experience', { underline: true })
      .moveDown(0.2)
      .fontSize(10);
    experiences.forEach(exp => {
      const start = formatDate(exp.start_date);
      const end = exp.is_current ? 'Present' : formatDate(exp.end_date);
      doc.text(`${exp.job_title} at ${exp.company_name} (${start} – ${end})`);
      if (exp.description) {
        doc.text(`  ${exp.description}`, { indent: 20 });
      }
      doc.moveDown(0.5);
    });
    doc.moveDown();
  }

  // Projects
  if (projects.length) {
    doc.fontSize(12)
      .text('Projects', { underline: true })
      .moveDown(0.2)
      .fontSize(10);
    projects.forEach(p => {
      doc.text(`• ${p.project_name}: ${p.long_description}`);
    });
    
    doc.moveDown();
  }

  // Volunteerings
  if (volunteerings.length) {
    doc.fontSize(12)
      .text('Volunteer Experience', { underline: true })
      .moveDown(0.2)
      .fontSize(10);
    volunteerings.forEach(vol => {
      const start = formatDate(vol.start_date);
      const end = vol.is_current ? 'Present' : formatDate(vol.end_date);
      doc.text(`${vol.role} at ${vol.organization} (${start} – ${end})`);
      if (vol.description) {
        doc.text(`  ${vol.description}`, { indent: 20 });
      }
      doc.moveDown(0.5);
    });
    doc.moveDown();
  }

  // Certifications
  if (certifications.length) {
    doc.fontSize(12)
      .text('Certifications', { underline: true })
      .moveDown(0.2)
      .fontSize(10);
    certifications.forEach(cert => {
      doc.text(`• ${cert.name} (${formatDate(cert.date)})`);
    });
    doc.moveDown();
  }

  doc.end();
}
