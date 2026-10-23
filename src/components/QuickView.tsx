import { about, contact, profile, projects, skills } from '../content'

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

      <section id="projekte" aria-labelledby="projekte-h">
        <h2 id="projekte-h">Projekte</h2>
        <ul className="cards">
          {projects.map((p) => (
            <li key={p.title} className="card">
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <ul className="tags" aria-label="Technologien">
                {p.tags.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              {p.links.length > 0 && (
                <p className="card__links">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href}>
                      {l.label}
                    </a>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section id="skills" aria-labelledby="skills-h">
        <h2 id="skills-h">Skills</h2>
        <div className="skills">
          {skills.map((g) => (
            <div key={g.name}>
              <h3>{g.name}</h3>
              <ul className="tags">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section id="ueber-mich" aria-labelledby="ueber-mich-h">
        <h2 id="ueber-mich-h">Über mich</h2>
        {about.map((para) => (
          <p key={para}>{para}</p>
        ))}
      </section>

      <section id="kontakt" aria-labelledby="kontakt-h">
        <h2 id="kontakt-h">Kontakt</h2>
        <p>
          <a className="button" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
        </p>
        <ul className="contact-links">
          {contact.links
            .filter((l) => l.href)
            .map((l) => (
              <li key={l.label}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
        </ul>
      </section>
    </main>
  )
}
