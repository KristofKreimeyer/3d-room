import { profile } from '../content'
import { AboutSection, ContactSection, ProjectsSection, SkillsSection } from './Sections'

// Die 2D-Schnellansicht: alle Inhalte als normale, semantische Seite.
// Sie ist der Weg für Recruiter mit wenig Zeit, für Screenreader und der Fallback ohne WebGL.
export function QuickView() {
  return (
    <main id="inhalt" className="quick">
      <header className="quick__intro">
        <h1>{profile.name}</h1>
        <p className="quick__role">{profile.role}</p>
        <p>{profile.tagline}</p>
        {profile.cv.href && (
          <p>
            <a className="button" href={profile.cv.href}>
              {profile.cv.label}
            </a>
          </p>
        )}
      </header>

      <ProjectsSection />
      <SkillsSection />
      <AboutSection />
      <ContactSection />
    </main>
  )
}
