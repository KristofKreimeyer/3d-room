import { about, contact, projects, skills } from '../content'

// Die vier Inhaltsbereiche. Sie werden in der Schnellansicht untereinander gezeigt
// und im 3D-Raum einzeln im Info-Panel.

export function ProjectsSection() {
  return (
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
  )
}

export function SkillsSection() {
  return (
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
  )
}

export function AboutSection() {
  return (
    <section id="ueber-mich" aria-labelledby="ueber-mich-h">
      <h2 id="ueber-mich-h">Über mich</h2>
      {about.map((para) => (
        <p key={para}>{para}</p>
      ))}
    </section>
  )
}

export function ContactSection() {
  return (
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
  )
}
