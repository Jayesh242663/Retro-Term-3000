import { useEffect, useRef } from 'react';
import { playEnterSound } from '../../utils/sounds';
import { portfolioData } from '../../data/portfolio';
import PythonIcon from '../PythonIcon';
import './InfoPanel.css';

const InfoPanel = ({ isOpen, onClose }) => {
  const panelRef = useRef(null);
  const contentRef = useRef(null);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        playEnterSound();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll to top when opened
  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getCurrentYear = () => new Date().getFullYear();
  const getExperienceYears = () => getCurrentYear() - 2021;

  return (
    <div className="info-panel-overlay" ref={panelRef}>
      <div className="info-panel">
        {/* Header */}
        <div className="info-header">
          <div className="info-header-left">
            <span className="info-subject">PERSONNEL FILE</span>
            <span className="info-separator">|</span>
            <span className="info-id">ID: JC-{getCurrentYear()}</span>
          </div>
          <button className="info-close" onClick={onClose} title="Close [ESC]">
            <span className="close-bracket">[</span>ESC<span className="close-bracket">]</span> CLOSE
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="info-content" ref={contentRef}>
          {/* Personal Information Section */}
          <div className="data-section">
            <div className="section-header">
              <span className="section-icon">◆</span>
              PERSONAL INFORMATION
            </div>
            
            <div className="data-grid">
              <div className="data-row">
                <span className="data-label">FULL NAME</span>
                <span className="data-value">{portfolioData.name.toUpperCase()}</span>
              </div>
              
              <div className="data-row">
                <span className="data-label">TITLE</span>
                <span className="data-value">{portfolioData.title.toUpperCase()}</span>
              </div>
              
              <div className="data-row">
                <span className="data-label">LOCATION</span>
                <span className="data-value">{portfolioData.location.toUpperCase()}</span>
              </div>
              
              <div className="data-row">
                <span className="data-label">EXPERIENCE</span>
                <span className="data-value">{getExperienceYears()}+ YEARS</span>
              </div>
            </div>
          </div>

          {/* Professional Summary */}
          <div className="data-section">
            <div className="section-header">
              <span className="section-icon">◆</span>
              PROFESSIONAL SUMMARY
            </div>
            <div className="summary-text">
              {portfolioData.about}
            </div>
          </div>

          {/* Contact Protocols */}
          <div className="data-section">
            <div className="section-header">
              <span className="section-icon">◆</span>
              CONTACT PROTOCOLS
            </div>
            
            <div className="data-grid">
              <div className="data-row">
                <span className="data-label">EMAIL</span>
                <span className="data-value data-link">
                  <a href={`mailto:${portfolioData.email}`} target="_blank" rel="noopener noreferrer">
                    {portfolioData.email}
                  </a>
                </span>
              </div>
              
              <div className="data-row">
                <span className="data-label">GITHUB</span>
                <span className="data-value data-link">
                  <a href={portfolioData.github} target="_blank" rel="noopener noreferrer">
                    {portfolioData.github}
                  </a>
                </span>
              </div>
              
              <div className="data-row">
                <span className="data-label">LINKEDIN</span>
                <span className="data-value data-link">
                  <a href={portfolioData.linkedin} target="_blank" rel="noopener noreferrer">
                    {portfolioData.linkedin}
                  </a>
                </span>
              </div>
            </div>
          </div>

          {/* Technical Competencies */}
          <div className="data-section">
            <div className="section-header">
              <span className="section-icon">◆</span>
              TECHNICAL COMPETENCIES
            </div>
            
            <div className="skills-matrix">
              <div className="matrix-category">
                <span className="matrix-label">PROGRAMMING LANGUAGES</span>
                <div className="matrix-tags">
                  {portfolioData.skills.languages.map((skill, i) => (
                    <span key={i} className="skill-tag">
                      {skill.toLowerCase() === 'python' ? (
                        <PythonIcon size="18px" />
                      ) : (
                        skill
                      )}
                    </span>
                  ))}
                </div>
              </div>

              <div className="matrix-category">
                <span className="matrix-label">FRONTEND TECHNOLOGIES</span>
                <div className="matrix-tags">
                  {portfolioData.skills.frontend.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="matrix-category">
                <span className="matrix-label">BACKEND TECHNOLOGIES</span>
                <div className="matrix-tags">
                  {portfolioData.skills.backend.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="matrix-category">
                <span className="matrix-label">DATABASE SYSTEMS</span>
                <div className="matrix-tags">
                  {portfolioData.skills.databases.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>

              <div className="matrix-category">
                <span className="matrix-label">TOOLS & PLATFORMS</span>
                <div className="matrix-tags">
                  {portfolioData.skills.tools.map((skill, i) => (
                    <span key={i} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notable Projects */}
          <div className="data-section">
            <div className="section-header">
              <span className="section-icon">◆</span>
              NOTABLE PROJECTS
            </div>
            
            {portfolioData.projects.map((project, index) => (
              <div key={index} className="project-item">
                <div className="project-header">
                  <span className="project-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="project-name">{project.name}</span>
                </div>
                <div className="project-desc">{project.description}</div>
                <div className="project-tech">
                  <span className="tech-label">STACK:</span>
                  {project.tech.map((tech, i) => (
                    <span key={i} className="tech-badge">{tech}</span>
                  ))}
                </div>
                {project.link && (
                  <div className="project-link">
                    <a href={project.link} target="_blank" rel="noopener noreferrer">
                      ▸ VIEW PROJECT
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Education & Certifications */}
          <div className="data-section">
            <div className="section-header">
              <span className="section-icon">◆</span>
              EDUCATION & CERTIFICATIONS
            </div>
            
            {portfolioData.education && portfolioData.education.map((edu, index) => (
              <div key={index} className="experience-item">
                <div className="experience-header">
                  <span className="experience-role">{edu.degree}</span>
                  <span className="experience-period">{edu.period}</span>
                </div>
                <div className="experience-company">{edu.institution}</div>
                {edu.details && <div className="experience-desc">{edu.details}</div>}
              </div>
            ))}
          </div>

          {/* Certifications */}
          {portfolioData.certifications && portfolioData.certifications.length > 0 && (
            <div className="data-section">
              <div className="section-header">
                <span className="section-icon">◆</span>
                CERTIFICATIONS
              </div>
              
              {portfolioData.certifications.map((cert, index) => (
                <div key={index} className="experience-item">
                  <div className="experience-header">
                    <span className="experience-role">{cert.name}</span>
                    <span className="experience-period">{cert.date}</span>
                  </div>
                  <div className="experience-company">{cert.issuer}</div>
                  {cert.link && (
                    <div className="project-link">
                      <a href={cert.link} target="_blank" rel="noopener noreferrer">
                        ▸ VIEW CERTIFICATE
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="info-footer">
          <div className="footer-left">
            <span className="footer-code">RETRO-TERM-3000</span>
            <span className="footer-separator">|</span>
            <span className="footer-code">PERSONNEL FILE</span>
          </div>
          <div className="footer-right">
            <span className="footer-timestamp">
              GENERATED: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
