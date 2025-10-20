'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [formData, setFormData] = useState({
    salutation: '',
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [formMessage, setFormMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('sending')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setFormStatus('success')
        setFormMessage('Danke für deine Mitteilung, wir melden uns in Kürze bei dir.')
        setFormData({
          salutation: '',
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        })
      } else {
        setFormStatus('error')
        setFormMessage('Es gab ein Problem beim Senden der Nachricht. Bitte versuche es später erneut.')
      }
    } catch (error) {
      setFormStatus('error')
      setFormMessage('Es gab ein Problem beim Senden der Nachricht. Bitte versuche es später erneut.')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <>
      <div id="start"></div>
      <nav className="navbar">
        <div className="container">
          <ul>
            <li><a href="#about">DIE BAND</a></li>
            <li><a href="#album">ALBUM</a></li>
            <li><a href="#video">VIDEO</a></li>
            <li><a href="#live">LIVE</a></li>
            <li><a href="#contact">KONTAKT</a></li>
            <li><a href="#impressum">IMPRESSUM</a></li>
          </ul>
        </div>
      </nav>

      <div className="head">
        <div className="container">
          <Image 
            src="/img/logo_simple.png" 
            alt="Roadhouse Logo" 
            width={600} 
            height={200}
            priority
            style={{ maxWidth: '100%', height: 'auto' }}
          />
          <div style={{ marginTop: '30px' }}>
            <Image 
              src="/img/Band/rh_350x204_vignette.jpeg" 
              alt="Roadhouse Band" 
              width={350} 
              height={204}
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </div>
      </div>

      <div id="home" className="content-container">
        <div className="container">
          <h3>Roadhouse - the band</h3>
          <p className="subheader">.... sind fünf Jungs aus dem Wiesental, die guten alten klassischen Hardrock spielen. Handgemacht, heftig, deftig und vor allem mit viel Herzblut.</p>
          <p className="subheader">Freut euch auf Roadhouse Live '25 ... wir rocken das!</p>

          <div style={{ marginTop: '40px' }}>
            <h4>News</h4>
            <ul className="news">
              <li>Weiter gehts mit Roadhouse - live am <b>20.9.</b> beim Open Air im Stadtpark Schopfheim. Ab ab 16:00 feiern die <a href="https://www.dampfkapelle.com/">Dampfkapelle</a>, ab 18 Uhr <b>Roadhouse</b> und ab 20 Uhr <a href="http://www.mario-s.net/">Mario Stracuzzi</a> mit Band das 30 Jährige Jubiläum von <a href="https://www.freies-radio-wiesental.de/">Freies Radio Wiesental</a></li>
              <li>Am <b>26.07.</b> rocken wir um 20:30 das <a href="https://dorfstuebli-maulburg.de/">Dorfstüble</a> in Maulburg, lasst euch das nicht entgehen! Geile Location, geile Band und ... geiles Publikum!</li>
            </ul>
          </div>
        </div>
      </div>

      <div id="about" className="content-container bg-grey">
        <div className="container">
          <h2>Die Band</h2>
          
          <div className="band-member">
            <div className="band-member-content">
              <p>
                Wir schreiben das Jahr 1992, als vier junge Musiker zwischen 19 und 24 ihre hoffnungsvolle Bandkarriere starten. Zunächst nannte sich die Band nach einer Mischung aus Lieblingsgetränk und Lieblingsfilm "Rothouse", dies war aber nur eine kurze, längst vergessene Phase. Die Jungs schrieben einige Songs selbst und nahmen ein paar Coverversionen dazu, um ein einziges legendäres Konzert in der Realschule in Zell zu spielen. Bald darauf verstreuten sich die Buben in alle Winde und Bands.
              </p>
              <p>
                Nach 28 Jahren schöpferischer Pause und Vorbereitung gab es das grosse Comeback, und die Band war nun endlich musikalisch da, wo sie schon früher gerne gewesene wäre ... gereift, besser, lauter ;-)
              </p>
              <p>
                Veränderungen gehören auch im Bandleben dazu und so wurde 2020 aus dem Quartett ein Quintett und Tastenmann Axel war fortan fester Bestandteil der Band.
              </p>
              <p>
                Nach dem Rückzug von Bassist und Gründungsmitglied Dirk, stiess Ende 2023 Nico Kapitz zur Band und brachte jugendlichen Elan und frischen Wind in die Truppe.
              </p>
            </div>
            <div>
              <Image src="/img/roadhouse_1992.png" alt="Roadhouse 1992" width={300} height={400} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>

          <div className="band-member">
            <div>
              <Image src="/img/Band/Niels.jpeg" alt="Niels Klemm" width={300} height={400} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
            <div className="band-member-content">
              <h4>Niels Klemm: Gesang, Gitarre</h4>
              <p>
                Im Alter von ca. 11 Jahren entdeckte er die Liebe zur Musik, beim Durchstöbern von Vaters Plattensammlung. Hierbei stiess er auf seine grosse Liebe, den Beatles. Die Anfänge der aktiven Musik lagen im Kinderchor!!! Mit 14 Jahren versuchte er sich am Keyboard, danach am Schlagzeug. Nebenher brachte er sich autodidaktisch das Gitarrespielen bei.
              </p>
              <p>
                In der ersten Phase von Roadhouse versuchte sich Niels dann erstmals als Sänger. 1994 zog es ihn dann, zusammen mit Stephan, zur Hard-Rock-Funk-Band ALICE IN VOODOOLAND.
              </p>
              <p>
                Nach einer künstlerischen Pause und kleinen Gastauftritten in verschiedenen Bands und Musikstilen, trat er dann 1999 der Formation SHAKE "S", einer Rock-Soul-Funk Formation bei. Nach deren Auflösung war er Mitbegründer der DAMPFKAPELLE.
              </p>
            </div>
          </div>

          <div className="band-member">
            <div className="band-member-content">
              <h4>Stephan Siebert: Drums, Gesang</h4>
              <p>
                Mit 13 Jahren entdeckte Stephan die Liebe zur Musik. Er fand heraus, dass man mit einem Schlagzeug ganz doll Lärm machen kann. Das Schlagzeugspielen brachte er sich selbst bei. Mit sechzehn entdeckte er seine Vorliebe zur Rockmusik. Nach der ersten Roadhouse Phase heuerte er von 1994 bis 1996 in der Hardrock-Funky-Band ALICE IN VOODOOLAND an. Nach längerer Künstlerpause fand er im Jahr 2001 sein Glück als Drummer in einer Rock-Cover-Band namens SOLUTION, bevor er 2002 dann schliesslich die DAMPFKAPELLE komplettierte.
              </p>
              <p>
                Seine Vorbilder an den Drums sind Mike Portnoy, Simon Phillips und natürlich John Bonham.
              </p>
            </div>
            <div>
              <Image src="/img/Band/Stephan.jpeg" alt="Stephan Siebert" width={300} height={400} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>

          <div className="band-member">
            <div>
              <Image src="/img/Band/Carsten.jpeg" alt="Carsten Lau" width={300} height={400} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
            <div className="band-member-content">
              <h4>Carsten Lau: Gitarre</h4>
              <p>
                Carstens musikalische Karriere begann im Alter von 7 Jahren an der Blockflöte. Mit 10 intensivierte er das Spiel mit den Blasinstrumenten und lernte Horn, Tuba und Tenorhorn.
              </p>
              <p>
                Im Alter von 20 Jahren begann Carsten mit dem Gitarre spielen. Das Solo in Barclay James Harvests <i>Nova Lepidoptera</i> auf dem Album <i>Berlin</i> weckte in ihm den Wunsch, so etwas auch selbst zu können. 1993 stiess er zur Band Roadhouse und prägte in dieser Zeit den Sound der Band mit, stilistisch nun in deutlich rockigeren Gefilden.
              </p>
              <p>
                Die Zeit nach der ersten Phase der Band nutzte Carsten zur musikalischen und technischen Weiterentwicklung (Aufnahmetechnik) und spielte zuletzt bei der Band DOUBLE VISION. Zu seinen musikalischen Vorbildern zählt Carsten neben den Blues Rockern Jeff Healey und Gary Moore (ok, der machte nicht nur Blues ;-)) auch David Gilmour und vor allem die Hard Rock Legende Ritchie Blackmore.
              </p>
            </div>
          </div>

          <div className="band-member">
            <div className="band-member-content">
              <h4>Axel Kummerer: Keyboards</h4>
              <p>
                Axel fing an im Alter von 5 Jahren Klavierunterricht zu nehmen. Bis zu seinem 16. Lebensjahr wurde sein Spiel geprägt von den klassischen Grossmeistern - allen voran - Johann Sebastian Bach. Nach einer ersten Rockband aus Weil-Haltingen folgte eine knapp einjährige Zusatzausbildung in Sachen Jazz und Improvisation. Eine Jazz-Combo aus Schopfheim, die sich den gängigen Jazz-Standards verschrieben hatte, war die Folge.
              </p>
              <p>
                Nach 1990 folgten ein Umzug und 30 Lebensjahre im Köln-Aachener Raum. Hier waren eine Coverband und drei Rockbands prägend - vor allem aber die letzte aus Düren, die sich mit Eigenkompositionen dem skandinavischen Symphonic Rock Metal à la Nightwish widmete. Ebenso nahmen progressive Elemente - geprägt von Genesis, Pink Floyd, Dream Theater und VandenPlas - Einzug in sein Spiel.
              </p>
              <p>
                Zurück in der alten Heimat wirkte er nach 2018 ein Jahr lang bei einer Rockband in Binzen mit und spielt heute wieder in Weil-Haltingen in einer groovigen Funk/Soul Acid-Jazz-Band. Jedoch fehlte ihm der Rock, der erdige Sound einer röhrenden Hammond, warmen Flächensounds und knallende Synthlines.
              </p>
              <p>
                Und so stieg er im September 2020 bei Roadhouse ein und bedient dort rockig-melodiös, hier und da ein wenig progressiv aber auch mit vielen interessanten Harmoniegebilden, die Tasten.
              </p>
            </div>
            <div>
              <Image src="/img/Band/Axel.jpeg" alt="Axel Kummerer" width={300} height={400} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>

          <div className="band-member">
            <div>
              <Image src="/img/Band/Nico.jpeg" alt="Nico Kapitz" width={300} height={400} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
            <div className="band-member-content">
              <h4>Nico Kapitz: Bass</h4>
              <p>
                Nico ist der Jüngste in der Truppe - auch wenn er nach eigenen Angaben den ältesten Musikgeschmack hat.
              </p>
              <p>
                1988 zerklopfte er im Alter von drei Jahren mit den Drumsticks aus der Band seines Vaters zu Hause die Salatschüsseln und bekam deswegen mit vier sein erstes Schlagzeug. Ab da war die Richtung klar. Zu Platten der Beatles (White Album und Sgt. Pepper's) brachte er sich das Schlagzeugspielen selbst bei und später (wegen der Unfähigkeit des Gitarristen in der ersten Schülerband) zu Songs von Deep Purple und Pink Floyd auch das Gitarrenspiel.
              </p>
              <p>
                Er trommelte danach in den Jugendbands „Gicht" (Metal) und „Joyous Daze" (Alternative Rock) und spielte in Markus Götz' Bigband und im „Groove Orchestra" Gitarre, bevor er am Schlagzeug bei Mario Stracuzzis „Marionettes" (damals noch „X-Cover") anfing und in mehreren Projekt-Bands mitwirkte.
              </p>
              <p>
                Später gründete er die Metal-Band „Thunderer" mit, deren Gitarrist und Sänger er heute noch ist. Den Bass hatte er bis dahin eigentlich nur sporadisch in der Hand - bis er die Herausforderung bei Roadhouse annahm.
              </p>
              <p>
                Seine musikalischen Vorbilder sind Ringo Starr, Ian Paice, David Gilmour, Tony Iommy, Roger Waters (für Bassfreunde) und Berndt Mühlbach von der Dampfkapelle.
              </p>
            </div>
          </div>

          <h2 style={{ marginTop: '60px' }}>* Ehemalige Mitglieder *</h2>

          <div className="band-member">
            <div className="band-member-content">
              <h4>Dirk Buchleither: Bass</h4>
              <p>
                Dirk begann seine musikalische Karriere 1991. Er wurde von seinem Freund Niels Ole mit den Worten "Hey Buchi, mir hän ä Band aber s'fehlt no de Bassischd" angesprochen. Tags drauf besorgte man einen günstigen Bass samt Verstärker und los ging's. Der erste Song war <span style={{ fontStyle: 'italic' }}>Sharp Dressed Man</span> von ZZ Top und kurze Zeit später wurde aus der Gruppierung Roadhouse.
              </p>
              <p>
                Dirks musikalische Vorlieben sind genauso vielfältig wie die Erfahrungen, die er in verschiedensten Bands und Stilistiken sammeln durfte. So zupfte er die Saiten bei ALICE IN VOODOOLAND, der AMH-BAND und RAT SALAD aus Konstanz, RUMPLETEAZER aus Heddesheim, LOUNGEFLY aus Karlsruhe, KÜNSTLERPECH aus Rheinfelden und zuletzt bei DOUBLE VISION.
              </p>
              <p>
                Ausserdem ist Dirk ein echter Gear-Nerd ... ;o)
              </p>
            </div>
            <div>
              <Image src="/img/Band/Dirk.jpeg" alt="Dirk Buchleither" width={300} height={400} style={{ maxWidth: '100%', height: 'auto' }} />
            </div>
          </div>
        </div>
      </div>

      <div id="album" className="content-container">
        <div className="container">
          <h2>Album</h2>
          <div className="album-images">
            <Image src="/img/album/journey_cover.png" alt="The Journey Cover" width={350} height={350} />
            <Image src="/img/album/journey_middle.png" alt="The Journey Middle" width={350} height={350} />
            <Image src="/img/album/journey_back.png" alt="The Journey Back" width={350} height={350} />
          </div>
          <hr />
          <div className="streaming-logos">
            <a href="https://open.spotify.com/album/3LXmioOluv8T8MYeOEJ7dj?si=pFX04t5HR1GnGV2706FZ5A" target="_blank" rel="noopener noreferrer">
              <Image src="/img/streamingLogos/listen-spotify.png" alt="Spotify" width={120} height={80} />
            </a>
            <a href="https://music.apple.com/de/album/the-journey/1743909129" target="_blank" rel="noopener noreferrer">
              <Image src="/img/streamingLogos/listen-applemusic.webp" alt="Apple Music" width={120} height={80} />
            </a>
            <a href="https://music.amazon.de/albums/B0D2Z729G8" target="_blank" rel="noopener noreferrer">
              <Image src="/img/streamingLogos/amazon-music.png" alt="Amazon Music" width={120} height={80} />
            </a>
            <a href="https://deezer.page.link/M7Xt8WP3yhtQYf1A9" target="_blank" rel="noopener noreferrer">
              <Image src="/img/streamingLogos/listen-deezer.png" alt="Deezer" width={120} height={75} />
            </a>
          </div>
        </div>
      </div>

      <div id="video" className="content-container bg-grey">
        <div className="container">
          <h2>VIDEO</h2>
          <div className="video-container">
            <div className="responsive-video">
              <iframe 
                src="https://www.youtube.com/embed/SaT6hlaLeig" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </div>
      </div>

      <div id="live" className="content-container">
        <div className="container">
          <h2>Live Tour 2025</h2>
          <div className="live-dates">
            <div className="live-date">
              <div className="live-date-day">11.04.2025</div>
              <div>Dorfstübli in Maulburg</div>
            </div>
            <div className="live-date">
              <div className="live-date-day">24.05.2025</div>
              <div>Alte Schlosserei, Wehr</div>
            </div>
            <div className="live-date">
              <div className="live-date-day">03.07.2025</div>
              <div>Dadscha Open Air, Wieslet</div>
            </div>
            <div className="live-date">
              <div className="live-date-day">26.09.2025</div>
              <div>Dorfstübli in Maulburg</div>
            </div>
            <div className="live-date">
              <div className="live-date-day">29.11.2025</div>
              <div>Ochsen, Maulburg</div>
            </div>
          </div>

          <div className="gallery">
            <Image src="/img/galerie/k2.png" alt="Krone 23.03.2024" width={250} height={250} />
            <Image src="/img/galerie/k4.png" alt="Krone 23.03.2024" width={250} height={250} />
            <Image src="/img/galerie/k1.png" alt="Krone 23.03.2024" width={250} height={250} />
            <Image src="/img/galerie/k3.png" alt="Krone 23.03.2024" width={250} height={250} />
            <Image src="/img/galerie/s6.png" alt="Alte Schlosserei 27.04.2024" width={250} height={250} />
            <Image src="/img/galerie/s2.png" alt="Alte Schlosserei 27.04.2024" width={250} height={250} />
            <Image src="/img/galerie/s3.png" alt="Alte Schlosserei 27.04.2024" width={250} height={250} />
            <Image src="/img/galerie/s5.png" alt="Alte Schlosserei 27.04.2024" width={250} height={250} />
            <Image src="/img/galerie/s1.png" alt="Alte Schlosserei 27.04.2024" width={250} height={250} />
            <Image src="/img/galerie/s7.png" alt="Alte Schlosserei 27.04.2024" width={250} height={250} />
            <Image src="/img/galerie/v1.jpg" alt="Café Verkehrt 30.11.2024" width={250} height={250} />
            <Image src="/img/galerie/v2.jpg" alt="Café Verkehrt 30.11.2024" width={250} height={250} />
            <Image src="/img/galerie/v3.jpg" alt="Café Verkehrt 30.11.2024" width={250} height={250} />
          </div>
        </div>
      </div>

      <div id="contact" className="content-container bg-grey">
        <div className="container">
          <h2>Kontakt</h2>
          <p style={{ textAlign: 'center', marginBottom: '20px' }}>
            Wenn ihr Fragen, Wünsche oder Anregungen habt, unser Album kaufen möchtet, oder wenn ihr einfach Feedback geben möchtet zu einem Auftritt oder zur Website oder oder oder, nehmt doch einfach Kontakt mit uns auf. Wir freuen uns über jede ernst gemeinte Message ;-)
          </p>
          <div className="social-media">
            <p>Wir sind ebenfalls erreichbar über Social Media:</p>
            <a href="https://www.facebook.com/roadhousewiesental" target="_blank" rel="noopener noreferrer">
              <Image src="/img/logo_facebook.png" alt="Facebook" width={40} height={40} />
            </a>
            <a href="https://www.instagram.com/roadhouse_rock/" target="_blank" rel="noopener noreferrer">
              <Image src="/img/logo_instagram.webp" alt="Instagram" width={40} height={40} />
            </a>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
            Alle mit * markierten Felder werden benötigt
          </p>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Anrede</label>
              <select name="salutation" value={formData.salutation} onChange={handleChange}>
                <option value="">Bitte wähle eine Anrede</option>
                <option value="Herr">Herr</option>
                <option value="Frau">Frau</option>
              </select>
            </div>

            <div className="form-group">
              <label>Name *</label>
              <input 
                type="text" 
                name="name" 
                placeholder="Dein Name" 
                value={formData.name}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label>E-Mail *</label>
              <input 
                type="email" 
                name="email" 
                placeholder="E-Mail Adresse" 
                value={formData.email}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label>Telefon</label>
              <input 
                type="tel" 
                name="phone" 
                placeholder="+49 1234 56789" 
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Betreff *</label>
              <input 
                type="text" 
                name="subject" 
                placeholder="Dein Betreff" 
                value={formData.subject}
                onChange={handleChange}
                required 
              />
            </div>

            <div className="form-group">
              <label>Mitteilung *</label>
              <textarea 
                name="message" 
                placeholder="Deine Mitteilung an uns"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            {formStatus === 'success' && (
              <div className="alert alert-success">
                {formMessage}
              </div>
            )}

            {formStatus === 'error' && (
              <div className="alert alert-error">
                {formMessage}
              </div>
            )}

            <div className="form-group">
              <button type="submit" className="btn" disabled={formStatus === 'sending'}>
                {formStatus === 'sending' ? 'Senden...' : 'E-Mail senden'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div id="impressum" className="content-container">
        <div className="container">
          <h2>Impressum</h2>
          <p>Informationen und rechtliche Hinweise gemäss § 5 TMG und § 2 DL-InfoV<br /><br />
            <strong>Roadhouse - the band</strong>
          </p>
          <p>vertreten durch:<br /><br />
            Carsten Lau | Käppelemattweg 125 | D-79650 Schopfheim
          </p>
          <p>Telefon +49 7622 9105 | E-Mail <a href="mailto:info@roadhouse-rock.com">info@roadhouse-rock.com</a>
            <br /><br />
            Verantwortlich für diese Seite gemäss § 5 Telemediengesetz (TMG)<br />
            Carsten Lau<br /><br />
            Haftungshinweis<br />
            Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links.<br />
            Für den Inhalt der verlinkten Seiten sind ausschliesslich deren Betreiber verantwortlich.<br /><br />
            Alle Inhalte (Texte, Graphiken, Layout, Fotos) dieser Internetpräsentation sind urheberrechtlich geschützt. Eine Vervielfältigung in jeglicher Art und Form ist ohne unser ausdrückliches und schriftliches Einverständnis nicht gestattet. Bitte wenden Sie sich unter Angabe des Verwendungszwecks an uns, wenn Sie Inhalte unserer Internetpräsentation ausserhalb unserer Internetpräsentation verwenden möchten.<br /><br />
            Copyright © 2020
          </p>
        </div>
      </div>

      <footer>
        <a href="#start" className="to-top">
          ↑
        </a>
        <p>by <a href="http://www.lau-is.de" title="http://www.lau-is.de/">lau.is</a></p>
      </footer>
    </>
  )
}
