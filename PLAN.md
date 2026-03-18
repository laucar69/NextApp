# Roadhouse Relaunch Plan

## Ziel

Neuer, moderner Webauftritt fuer Roadhouse auf Basis von Next.js.

Der Relaunch soll:

- die Band klar und hochwertig praesentieren
- auf Mobilgeraeten und Desktop gut funktionieren
- Inhalte spaeter leicht pflegbar machen
- eine solide technische Basis fuer weitere Ausbaustufen schaffen
- als dynamische Anwendung mit redaktionell pflegbaren Inhalten funktionieren

## Technisches Zielbild

Die neue Roadhouse-Seite soll als dynamische Next.js-Anwendung aufgebaut werden.

Geplant ist:

- ein Onepager als oeffentlich sichtbare Website
- eine Admin-/Redaktionsansicht, die ueber eine bestimmte URL oder einen Parameter erreichbar ist
- Zugriff auf Redaktionsfunktionen nur nach Anmeldung
- Speicherung von Seitenstruktur und Inhalten in einer Datenbank

Der Betreuer der Seite soll spaeter:

- Content-Sections anlegen und loeschen koennen
- die Reihenfolge und Struktur der Sections verwalten koennen
- automatisch die Navigation aus den vorhandenen Sections ableiten koennen
- innerhalb einer Section mehrere Module untereinander einfuegen koennen

Zum Start sind fuer Sections diese Modultypen vorgesehen:

- Titel
- Text
- Bild
- Bild-Text

Fuer das Modul Bild-Text soll es mindestens diese Option geben:

- Bild links / Bild rechts

## Technische Leitplanken

- [ ] Next.js als Anwendungsbasis nutzen
- [ ] Inhalte datenbankbasiert speichern
- [ ] Seitenstruktur getrennt von Darstellung modellieren
- [ ] Oeffentliche Website und Redaktionsbereich sauber voneinander trennen
- [ ] Authentifizierung fuer Admin-/Redaktionszugang vorsehen
- [ ] Modulkonzept so aufbauen, dass spaeter weitere Modultypen leicht erweiterbar sind

## Projektphasen

### 1. Grundlagen

- [ ] Zielbild fuer den neuen Auftritt abstimmen
- [ ] Tonalitaet, Stil und visuelle Richtung festlegen
- [ ] Inhaltsstruktur der Startseite definieren
- [ ] Technische Basis pruefen und aufraeumen
- [ ] Technische Zielarchitektur fuer Website, Datenmodell und Redaktionszugang festlegen

### 2. Informationsarchitektur

- [ ] Hauptbereiche der Seite festlegen
- [ ] Navigationsstruktur definieren
- [ ] Inhalte aus dem Altbestand sichten und priorisieren
- [ ] Entscheiden, welche Inhalte zum Start live gehen
- [ ] Regeln festlegen, wie Navigation aus den Content-Sections erzeugt wird

### 3. Designsystem

- [ ] Farbwelt definieren
- [ ] Typografie festlegen
- [ ] Abstaende, Raster und Breakpoints definieren
- [ ] Wiederverwendbare UI-Bausteine festlegen

### 4. Startseite

- [ ] Hero-Bereich gestalten
- [ ] Bandvorstellung aufbauen
- [ ] News-/Aktuelles-Bereich integrieren
- [ ] Live-Termine sinnvoll praesentieren
- [ ] Medienbereich fuer Bilder / Video / Album vorbereiten
- [ ] Kontakt- oder Call-to-Action-Bereich definieren

### 5. Inhalte und Daten

- [ ] Texte ueberarbeiten
- [ ] Bildmaterial auswaehlen und optimieren
- [ ] Struktur fuer Termine und News festlegen
- [ ] Vorbereitung fuer spaetere Pflege der Inhalte schaffen
- [ ] Datenmodell fuer Seiten, Sections und Module definieren
- [ ] Modultypen und deren Felder spezifizieren

### 6. CMS / Redaktion

- [ ] Login-Konzept fuer Admin-/Redaktionsbereich definieren
- [ ] Redaktionszugang ueber geeignete URL-Struktur planen
- [ ] UI fuer das Anlegen, Loeschen und Sortieren von Sections planen
- [ ] UI fuer das Einfuegen und Sortieren mehrerer Module innerhalb einer Section planen
- [ ] Bearbeitungsmaske fuer die ersten vier Modultypen planen
- [ ] Verhalten fuer Entwurf / Veroeffentlichung / sofort live abstimmen

### 7. Technik und Qualitaet

- [ ] Responsive Verhalten sauber ausarbeiten
- [ ] Performance-Basis pruefen
- [ ] SEO-Basis einrichten
- [ ] Accessibility-Basis sicherstellen
- [ ] Browser- und Geraetetests durchfuehren
- [ ] Datenbankanbindung und Serverlogik sauber strukturieren
- [ ] Berechtigungen und Zugriffsschutz pruefen

### 8. Vorbereitung fuer Launch

- [ ] Finale Inhalte einpflegen
- [ ] Impressum / Datenschutz / Kontakt pruefen
- [ ] Deployment-Setup abstimmen
- [ ] Abschlussreview vor Livegang

## Offene Entscheidungen

- [ ] Onepager oder mehrere Unterseiten?
- [ ] Eher roh-rockig, klassisch oder modern-premium?
- [ ] Wie prominent sollen Live-Termine und News auf der Startseite sein?
- [ ] Soll ein Kontaktformular direkt zum Start enthalten sein?
- [ ] Welche Datenbank soll verwendet werden?
- [ ] Welche Authentifizierung soll fuer den Redaktionsbereich eingesetzt werden?
- [ ] Soll die Admin-Ansicht ueber eigene Route, Query-Parameter oder beides erreichbar sein?
- [ ] Braucht es Entwurfsmodus / Preview oder reicht zunaechst direktes Live-Bearbeiten?
- [ ] Sollen Inhalte versioniert oder zumindest aenderbar mit Verlauf vorbereitet werden?

## Naechste konkrete Schritte

- [ ] Gemeinsame Richtung fuer Look & Feel festlegen
- [ ] Technisches Konzept fuer Datenmodell, Admin-Bereich und Modulstruktur definieren
- [ ] Grundstruktur der neuen Startseite definieren
- [ ] Erste visuelle Version der Hello-World-Seite zu einem echten Landing-Page-Entwurf ausbauen
