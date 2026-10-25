import { Component, type ReactNode } from 'react'

type Props = { onError: () => void; children: ReactNode }

// Fängt Fehler der 3D-Szene (z. B. Modell nicht ladbar) ab, damit die Schnellansicht weiter funktioniert.
export class SceneBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
