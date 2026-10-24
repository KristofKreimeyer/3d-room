// Alle Inhalte der Seite an einer Stelle. Texte hier ändern, nicht in den Komponenten.

export type Project = {
  title: string
  summary: string
  tags: string[]
  links: { label: string; href: string }[]
}

export type SkillGroup = {
  name: string
  items: string[]
}

export type SectionId = 'projekte' | 'skills' | 'ueber-mich' | 'kontakt'

export const sections: { id: SectionId; label: string; object: string }[] = [
  { id: 'projekte', label: 'Projekte', object: 'Monitor' },
  { id: 'skills', label: 'Skills', object: 'Whiteboard' },
  { id: 'ueber-mich', label: 'Über mich', object: 'Bücherregal' },
  { id: 'kontakt', label: 'Kontakt', object: 'Smartphone' },
]

export const profile = {
  name: 'Kristof Kreimeyer',
  role: 'Senior Software Engineer',
  tagline: 'Ich baue Web-Apps mit React und Tailwind, von der Idee bis zur fertigen Seite.',
  cv: { label: 'Lebenslauf (PDF)', href: '' },
}

export const projects: Project[] = [
  {
    title: '3D-Arbeitszimmer',
    summary:
      'Dieses Portfolio: ein begehbares 3D-Arbeitszimmer mit React Three Fiber, dazu eine barrierefreie Schnellansicht.',
    tags: ['React', 'Three.js', 'TypeScript'],
    links: [{ label: 'Code auf GitHub', href: 'https://github.com/KristofKreimeyer/3d-room' }],
  },
  {
    title: 'EnergyHunt',
    summary:
      'Eine Seite, die die besten Energy-Drink-Angebote findet und übersichtlich nebeneinanderstellt. Umgesetzt mit React und Tailwind.',
    tags: ['React', 'Tailwind CSS'],
    links: [{ label: 'Zur Seite', href: 'https://energyhunt.pages.dev/' }],
  },
  {
    title: 'Retro-Konsole als Website',
    summary: 'Eine Retro-Spielkonsole, die als interaktive Website im Browser läuft. Umgesetzt mit React und Tailwind.',
    tags: ['React', 'Tailwind CSS'],
    links: [{ label: 'Zur Seite', href: 'https://kristof-kreimeyer.de/' }],
  },
]

export const skills: SkillGroup[] = [
  { name: 'Frontend', items: ['React', 'TypeScript', 'Vue', 'HTML/CSS', 'Tailwind CSS', 'Three.js'] },
  { name: 'Accessibility', items: ['Barrierefreiheit', 'UX/UI Thinking'] },
  { name: 'Werkzeuge', items: ['Git / GitHub', 'Storybook', 'Agile / Scrum', 'Figma', 'Vite'] },
]

export const about = [
  'Ich habe Informatik an der TU Dortmund studiert und das Studium nicht abgeschlossen, weil mich die Praxis früh mehr gereizt hat. Schon währenddessen bin ich bei einer E-Commerce-Agentur eingestiegen.',
  'Von dort ging es zu einem großen IT-Dienstleister, dann zu einem Produkthersteller und kurz in den öffentlichen Dienst. Heute arbeite ich bei einer Digitalagentur.',
  'Mich treiben sauberes Design und barrierefreie Umsetzung an: Das Internet soll für jede und jeden nutzbar sein.',
]

export const contact = {
  email: 'kontakt@kristof-kreimeyer.de',
  links: [
    { label: 'GitHub', href: 'https://github.com/KristofKreimeyer' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kristof-kreimeyer/' },
  ],
}
