# Speaker notes - How to Train Your Self-Printed Robot

Below is one entry per slide, in deck order. Edit the text under each
slide and hand the file back - it becomes the new speaker notes.
Write one paragraph per line. Replace '(no notes yet)' on slides that
have no notes yet. Do not edit the '## <number>. <title>' heading lines.
(The template-generated chapter Overview slides are not listed.)

## 1. Walking on Plastic (innovation_hacking_square_bitone.svg)

(no notes yet)

## 2. About Us (gatherf.png)

florian.gather@tngtech.com
tobias.weyer@tngtech.com
fabian.luebbe@tngtech.com
Und KArsten, der DIY Robot with Attitude.

## 3. Why Humanoids? (digit_stairs.jpg)

Florian
Für viele Use-cases reichen normale Roboter aus. Allerdings gibt es Szenarien, da eignen sich Humanoide deutlich besser:
Humanoide Roboter können in für den Menschen gebauten Umgebungen agieren, z.B. Treppen steigen, Türen öffnen, etc. Für andere Bauformen ist das deutlich schwerer.
In den USA hat jetzt ein Startup einen Roboter-Putzdienst gestartet. Ein Unitree G1 wird von einem Uber zum Kunden gebracht und der Roboter putzt dann dort.
Auf der anderen Seite sind humanoide Roboter auch deutlich komplexer und damit teurer und wartungsanfälliger.

## 4. State-of-the-Art Humanoids (figure_03.png)

Florian
Figure 3, 130k$,
Unitree G1 30-50k$
Tesla Optimus V3, 30k€, wenn er verfügbar ist
Zu den Anschaffungspreisen kommt noch hinzu, dass Ersatzteile schwer zu beschaffen sind und auch teuer sind. Bei unserem G1 gehen regelmäßig Joints kaputt, die kosten mehrere tausend Euro und haben lange Lieferzeiten.
Wir hätten natürlich auch einen fertigen Roboter kaufen, aber wir wollten auch lernen, was es bedeutet so einen Roboter von grund auf selbst zu bauen.

## 5. Berkeley Humanoid Lite (berkeley_lite_robot.png)

Tobias
Man hat gesehen, dass wir bei uns im Innovation Hacking nach Florians Ansage schon erst mal dicke Backen gemacht haben.
Aber na gut Florian ist immerhin einer unserer Partner hier bei TNG, also haben wir uns mal umgeschaut was man da so machen kann und sind schließlich auf den Berkeley Humanoid Lite gestoßen, einen komplett open source DIY Humanoider Roboter

## 6. Derived From a Research Robot (berkeley_research_robot.png)

Tobias
Die Opensource Variante stammt ursprünglich vom Berkeley Humanoid Research Robot von der University of California ab, mit welchem Lokomotion Research betrieben wurde, und dann haben sie der Welt eben noch eine self-printable open source Variante geschenkt

## 7. Berkeley Humanoid Lite (berkeley_teleop.mp4)

Tobias
Und diese Opensource Variante kann man tatsächlich komplett selbst zusammenbauen, wenn man einen 3D Drucker zuhause hat.
Hier sieht man das in der kleinen Kerl tatsächlich viel Potential hat. Sie haben hier in den Videos sowohl eine relativ agile Teleoperation demonstriert...

## 8. Berkeley Humanoid Lite (berkeley_walking.mp4)

Tobias
… als auch gezeigt, dass er in der Lage sein sollte erfolgreich auf seinen zwei Beinen zu gehen.
Wobei anzumerken ist, dass die Geschwindigkeit von diesem Video hier beschleunigt ist.
Nachdem wir das gesehen hatten, wollten wir mal sehen wie weit man mit diesem Projekt tatsächlich kommt

## 9. What It Takes to Build One (berkeley_lite_robot_cropped_left.png)

Fabian
Die Entscheidung war also gefallen. Wir werden diesen Roboter bauen. Nächste Frage: Was brauchen wir eigentlich?
Neben der 24 Motoren, die jeweils alle mit gekaufter Elektronik und Lagern versehen wurden, ist nahezu alles an dem Roboter 3D gedruckt.
WIr haben das auf mindestens 120 Teile geschätzt, wenn man die gedruckten Getriebe mit einbezieht, dann ist es gut mehr.
Die Bauteile drucken sich nicht von alleine...

## 10. System Overview (system_overview.png)

Fabian übernimmt
Das generelle System wird vorgestellt (inkl. Batterie und On-Board PC).
Dann die Frage von Fabian: "Aber warum hängt unser Roboter dann hier an diesem Kabel?"
--> Überleitung warum keine Batterie

## 11. System Overview (system_overview.png)

Florian: Das generelle System wird vorgestellt (inkl. Batterie und On-Board PC).
Dann die Frage von Fabian: "Aber warum hängt unser Roboter dann hier an diesem Kabel?" --> Überleitung warum keine Batterie

## 12. When a LiPo Takes a Hit (lipo_nail_test.mp4)

Florian: Solche Akkus können z.B. beim Hinfallen beschädigt werden und dann spektaktulär mit Abbrennen reagieren

## 13. Our Neighbours Tried That (lipo_burned_door.jpg)

Florian: Unsere Nachbarn im Karlsruher Büro haben einen LiPo-Akku fallen gelassen, der dann angefangen hatte zu reagieren und in der Eingangstür abgebrannt ist. Gut, dass das Gebäude nur diesen einen Notausgang hat.

## 14. Bought … (lipo_battery_box.jpg)

Florian: Da wir mit Stürzen des Roboters rechnen, haben wir die bereits gekaufte Batterie erst einmal verbannt und uns für Kabel entschieden

## 15. … and Banned (lipo_do_not_use.jpg)

Florian: Da wir mit Stürzen des Roboters rechnen, haben wir die bereits gekaufte Batterie erst einmal verbannt und uns für Kabel entschieden

## 16. Strong Drone Motors (motor_controller.jpg)

Tobias
Die ganze Energie will auch umgesetzt werden und zwar passiert das mit den 24 verbauten Motoren, die interessanterweise Drohnenmotoren sind.
Drohnenmotoren sind Hochleistungsmotoren, die auf maximale Leistung bei möglichst geringem Gewicht ausgelegt sind, was sie hervorragend auch für Humanoide Roboter eignet. Schließlich müssen sie am Ende auch ihr eigenes Gewicht mittragen
Die hier verbauten einzelnen Motoren haben eine Leistung von bis zu 1,7kW und können damit in ihrem eigentlichen Drohneneinsatzgebiet bis zu 9 Kg Schub erzeugen
Natürlich müssen die Motoren auch irgendwie angesteuert werden und dazu braucht jeder Motor auch einen Motorcontroller. Davon ist einer hier links auf der Folie abgebildet und Fabian wird euch dazu später noch ein bisschen mehr erzählen aber kleiner Spoiler: So ganz Pflegeleicht sind die nicht.
Als Drehmoment können sie bis zu 2,6 Nm aufbringen, allerdings reicht das allein noch nicht ganz aus, um mit zwei Beinen einen Roboter im Gesamtgewicht von knapp 15Kg zu tragen
Deshalb braucht es Getriebe

## 17. How Cycloidal Gears Work (cycloidal_principle.mp4)

Tobias
Als Getriebe kommen Zykloidgetriebe zum Einsatz.
Zykloidgetriebe zeichnen sich durch ihre kompakte Bauart bei hohem Übersetzungspotential und großer Stoßfestigkeit aus.
Und da bestimmt nicht viele von euch mit Zykloidgetrieben vertraut sind, schauen wir uns hier in der Animation mal an, wie ein solches Getriebe funktioniert und wie es seine hohe Übersetzung erreicht
Das Herzstück ist die blaue Zykloidscheibe.
welche von der grünen Exzenterwelle angetrieben wird
Durch die exzentrische Form der Exzenterwelle taumelt die Zykloidscheibe sozusagen im Getriebe und wird Zahn für Zahn immer eine Lücke zwischen zwei so genannten Ring Pins  weiter getrieben.
Und das führt dazu, dass für jede volle Umdrehung der Exzenterwelle die Zykloidscheibe um einen Zahn weiter wandert und dabei die rote Ausgangscheibe mitnimmt
Das heißt in diesem Beispiel bei 10 Ring Pins und 9 Zähnen der Zykloidscheibe, werden 9 volle Umdrehungen des Input Schafts gebraucht, um eine Umdrehung am Getriebeausgang zu erreichen.
Wir erhalten also ein Übersetzungsverhältnis von 9:1 was zu einem 9 mal größerem Drehmoment am Ausgang im Verhältnis zum Eingang führt.

## 18. 3D Printed Cycloidal Gears (cycloidal_gear_printed.mp4)

Tobias
Diese Getriebe bestehen, ausgenommen der Kugellager bei unserem Roboter komplett aus selbstgedruckten Komponenten
Dabei haben unsere Getriebe 16 Ring pins und 15 Zähne auf der Zykloidscheibe, was entsprechend zu einem Übersetzungsverhältnis von 15:1 führt.
Das heißt mit unseren Motoren führt das nominal zu fast 40 Nm Drehmoment am Getriebeausgang.
Zum Vergleich, der G1 von Unitree hat laut Hersteller je nach Modell 90 oder 120 Nm maximales Drehmoment im Kniegelenk, der Roboter ist aber auch doppelt so schwer.

## 19. Alternative Gears (harmonic_drive.png)

Tobias
Es gibt auch weitere Getriebearten, die bei Robotern und natürlich auch bei Humanoiden eingesetzt werden.
Der Klassiker ist das Harmonic Drive, das durch einen flexiblen Zahnkranz („Flexspline“) ein ähnliches Funkionsprinzip hat wie das eben vorgestellte Zykloidgetriebe, und vor allem durch seine hohe Übersetzungsdichte und Präzision glänzt.
Allerdings sind HD relativ teuer und vertragen auch Schläge nicht so gut, was sie weniger optimal für Humanoide Roboter macht
Der Trend geht daher tatsächlich zum Planetengetriebe, welche aufgrund iher kleineren Übersetzung gerne als Doppelgetriebe verbaut werden.
Planetengetriebe sind deutlich weniger Stoßanfällig, i.d.R. günstiger in der Produktion und besitzen eine gute Rücktreibbarkeit, das heißt sie können Gegenkräfte dynamischer und weicher Abfedern und sind deshalb insbesondere für Beingelenke gut geeignet.
Hier Rechts sieht man ein auseinandergebautes Planeten-Doppelgetriebe eines Unitree G1 Roboters, dem ihr hier heute bestimmt auch noch über den Weg laufen werdet.

## 20. Inertial Measurement Unit (imu_custom_board.jpg)

Fabian übernimmt
Roboter muss wissen wie er zum Boden positioniert ist und was derzeitige Winkelgeschwindigkeiten sind. Das ist (neben den Motorpositionen) seine Hauptinformationsquelle, die er zum Steuern verwendet.
Messung erfolgt mit IMUs, Herausforderungen sind
* Drift, Noise, Latenz
Im Verlauf unserer Experimente hat sich herausgestellt, dass das original Set-up für die IMU nicht präzise genug ist
Nach dem Umstieg auf eine Hiwonder IMU (rechts im Bild), war der Roboter deutlich stabiler

## 21. Cable Management (cable_management_before.jpg)

Fabian
"Mit Motoren, Getrieben, und IMU nähern wir uns rasant einem kompletten Roboter, aber auf dem Weg gab es noch ein paar Schwierigkeiten, die wir nicht verheimlichen wollen."
Wie so häufig ist auch die Verkabelung eines der Probleme, die sich nur bedingt im Voraus planen lässt. -> daher muss man erstmal ausprobieren
Hier sieht man die erste Extremität die fertig gestellt wurde.
Wenn dieser Arm mal nicht funktioniert -> viel Spaß beim Debuggen...

## 22. After a Few Iterations (cable_management_after.jpg)

Fabian
Daher Iteration:
Korrekte Längen der Kabel
Stecker für Stromversorgung und CAN Bus (Ansteuerung)
Zugentlastung -> Zug vom Kabel nicht an den Motorcontroller durchlassen
Man könnte die Kabel langristig noch in Textilband o.Ä. einwickeln -> hängen nicht so lose herum

## 23. Undocumented Details (joint_stops_cad_1.png)

Florian übernimmt
Eine weitere Herrausvorderung sind kleinere aber doch wichtige nicht dokumentierte Details.
Z.B. sind in sämtlichen Bauanleitung und Videotutorials diese markierten Gelenkanschläge niergends aufgetaucht, weswegen wir sie dann auch nicht montiert hatten, bis sie uns irgendwann bei einem genaueren Blick in das CAD Model zufällig aufgefallen sind.
Dabei sind die gar nicht so unwichtig, weil sie entscheidend sind für die Motorkalibrierung.
Wie Florian vorhin erklärt hat, können mit den eingebauten Motor Position Encodern die Motorpositionen bestimmt werden. Allerdings können daraus nicht automatisch auch die Gelenkwinkel bestimmt werden, ohne eine entsprechende Kalibrierung, um zu ermitteln, wie die Motorwinkel zu den Gelenkwinkel stehen.
Dazu muss man aktuell bei jedem Roboter Neustart eine Kalibrierungsfahrt aller Gelenke durchführen, bei welchen man eben an diese Anschläge als definierte Positionen fährt.

## 24. Unavailable Parts (brass_part_original.jpg)

Florian
Für mehr Stabilität wird im Gelenk ein Messingteil benötigt
Leider gibt es das in der Form nicht zu kaufen
-> DIY

## 25. Just Make Them Yourself (drilling_brass_part.mp4)

Florian
Unser Arbeitssicherheitsbeauftragter ist hoffentlich gerade nicht anwesend

## 26. Hardware Assembled (hardware_assembled.mp4)

Tobias
"Hardware haben wir beisammen, jetzt müssen wir sie richtig ansteuern"
Quasi die "Baby Experience"

## 27. Reinforcement Learning (rl_loop_plain.png)

Tobias
Hinführung RL Variante Roboter als Teil des Envs:
Policy -> KI Modell, das für jeden Zustand entscheidet, welche Aktion als nächstes ausgeführt werden soll.
Umgebung -> Roboter in seiner Umgebung: 1. Simulation (training) 2. Mujoco (Sim2Sim) 3. Echter Welt (Sim2Real) - Sim2Real Gap
Ziel: "Lernen, gute Actions auszuwählen" -> Kontext Laufen
Observation Space groß: 12 Motoren, IMU Werte, History ...
Action Space groß: 12 Motoren
"Gut": Für jeden relevanten State muss eine "gute" Action gewählt werden -> was ist gut?

## 28. Add a Reward (rl_loop_reward.png)

Tobias
Um qualität der Actions in einem State zu beurteilen, fügen wir einen Reward hinzu (bonbon / ZUCKERBROT UND PEITSCHE)
Reward hängt von State, Action und Folgestate ab
Reward design ist eine Kunst
"Mess around and find out" in zweierlei Hinsicht -> policy im training und wir mit reward shaping

## 29. Facts and Figures (parallel_envs.mp4)

Fabian
Genug der Theorie, wie sieht das in der Praxis aus?
Erst einmal braucht man GPUs -> wir hatten 5 zur Verfügung -> Anzahl war schon gut um Ideen schnell abstecken zu können, da jede neue Idee eines eigenen Trainings bedarf.
Diese GPUs waren alle große genug, da Modell nicht sonderlich groß
Und dann lässt man die Policy einfach vor sich hin probieren -> und zwar in 50k train steps und die policy kontrolliert 4096 roboter parallel in jedem Schritt
Bei 25 Hz sind das grob 2300 Roboter Stunden

## 30. Rewards (reward_curves.png)

Fabian
Wir haben den ominösen Reward vorhin bereits erwähnt, aber was ist dieses Bonbon in echt? Womit arbeitet man?
Viele Teile die in den Reward mit einfließen.
Anteile haben verschiedene Gewichtungen, die beeinflussen auf was die Policy primär und/oder zuerst reagiert.
Beispiele: feet airtime, feet slide fangen mit dem ersten Laufen an
Rechter Plot soll noch raus

## 31. Pretrained Policy (pretrained_policy_sim.mp4)

Fabian
Man sieht hier die "mitgelieferte" Policy.
Erster Eindruck: läuft recht flüssig
Probleme: Rennt eigentlich nur, stolpert gerne über die eigenen Füße
-> Sieht ja aber ganz gut aus, wie sieht das in der echten Welt aus?

## 32. Pretrained Policy (pretrained_policy_real.mp4)

Performance ist in der Realität nicht so gut wie in der Sim -> Sim2Ral Gap

## 33. Sim2Real Gap (sim2real.png)

Florian
Mass
Actuator Armature
Gear friction
Backlash
Latencies
Stiffness

## 34. Parameter Fitting (param_fit_old_pd.png)

Florian

## 35. Fitting PD Gains (param_fit_new_pd_unfitted.png)

Florian

## 36. Fitting Physical Parameters (param_fit_new_pd.png)

Florian

## 37. Backlash: 0.3 mm Less Play (backlash_disc.png)

Florian
d: 14,0mm →  13,7mm
TODO: Demonstrator zum Durchreichen von zwei Getrieben

## 38. Backlash: Old vs. New (backlash_old_new.mp4)

TODO: Demonstrator zum Durchreichen von zwei Getrieben

## 39. Overcorrections (overcorrection_sim.mp4)

Tobias
Das dachten wir auch...
Klassische Falle: Übermotiviertes umbauen der Rewards um das Verhalten zu beeinflussen
Hier: Bestrafung bei Unterschreiten einer Mindestdistanz zwischen den Ankle Roll motoren (die letzten im Bein, vorne auf dem Fuß) + Aufheben des Rewards der die Hüftgelenke mittig orientiert hält.
Idee: Weniger Incentive für Füße nah beieinander
Resultat: Überkorrektur

## 40. Overcorrections (tom_cowboy_walk.mp4)

Tobias
Video abspielen
Statt die Fußdistanz als Proxy für das eigentliche Problem (stolpern) zu nutzen bestrafen wir einfach Kollisionen des Roboters mit sich selbst.

## 41. External Pushes for Stability (external_pushes.mp4)

Tobias
Weitere Verbesserungen mit zusätzlichen Challenges in der Sim, z.B. mit externen Krafteinwirkungen für mehr Robustheit.
Roboter gleicht solange aus, bis ihm mechanisch die Grenzen aufgezeigt werden.

## 42. External Pushes for Stability (external_pushes_feet.mp4)

Tobias
Jetzt kann der Roboter sich im Gleichgewicht halten. Wie halten wir ihn davon ab über die eigenen Füße zu stolpern?
Ideen?
Abstand zwischen den Füßen belohnen? (Verbesserung durch zusätzliche Reward Funktionen)

## 43. Regular Repairs (repair_broken_ankle.jpg)

Jedes ausführen einer Policy auf dem echten Roboter ist natürlich mit Risiken verbunden...
Meistens mussten die Knöchel dran glauben.

## 44. Training With Obs History (obs_history_walking.mp4)

Florian

## 45. Handcrafted Rewards (handcrafted.png)

(no notes yet)

## 46. Handcrafted Rewards (handcrafted_gait_sim.mp4)

Florian
TODO: Video aus Sim mit handcrafted verbesserter gait Funktion, die den Laufstil verbessert

## 47. Handcrafted Rewards (handcrafted_gait.mp4)

Florian
Dieses Video:
- Hardware Fixed Backlash
- konstanter Fußabstand
- improved gait Funktion (TODO)
- Bodenkontaktzeit
- Bodenkontakt als Sinuskurve als Input

## 48. Motion Priors (motion-priors.png)

(no notes yet)

## 49. Motion Priors (motion-prior.mp4)

Fabian
TODO: Motion Prior Video als Referenz (vllt auch zwei unterschiedliche. Ein schöner normaler Lauf + einen lustigen Lauf)

## 50. Motion Priors (motion-prior-rl.mp4)

Fabian
TODO: Video Unserer Policy trainiert mit Motion Priors in Sim

## 51. What's Next? (NVIDIA_logo.png)

Florian
Arme Montieren und Bewegung mit Armen lernen
Batterie und internen Rechner
Motion Priors, z.B. mit Nvidia Sonic -> Später ein Vortrag im Robotik Track
Und mit Realdaten für Gewichte, Trägheitstensoren, Latenzen die Simulation verbessern, da wir davon ausgehen, dass die Original Berkeley-Werte noch Verbesserungspotenzial haben

## 52. SONIC in Action (g1_schuhplattler.mp4)

In München haben wir auch einen G1, der kann Schuhplatterln

## 53. Contributors (gatherf.png)

(no notes yet)

## 54. Thank you! (gatherf.png)

Thank you for your attention!

## 55. Backup

(no notes yet)

## 56. Nvidia SONIC (nvidia_sonic_pipeline.png)

Florian
Arme Montieren und Bewegung mit Armen lernen
Batterie und internen Rechner
Motion Priors, z.B. mit Nvidia Sonic -> Später ein Vortrag im Robotik Track
Und mit Realdaten für Gewichte, Trägheitstensoren, Latenzen die Simulation verbessern, da wir davon ausgehen, dass die Original Berkeley-Werte noch Verbesserungspotenzial haben

## 57. ROS 2 (ros2_ecosystem.jpg)

(no notes yet)

## 58. Cycloidal Disc With Bearings (cycloidal_disc_bearings.mp4)

(no notes yet)

## 59. Early Walking Attempts (backup_clip_2.mp4)

(no notes yet)

## 60. Early Walking Attempts (backup_clip_3.mp4)

(no notes yet)

## 61. Early Walking Attempts (backup_clip_4.mp4)

(no notes yet)

