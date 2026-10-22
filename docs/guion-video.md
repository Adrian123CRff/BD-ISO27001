# Guion del video (5 minutos)

Frases cortas, en primera persona, para adaptarlas a tu forma de hablar. Cada bloque indica qué mostrar en pantalla y
qué comando correr. A un ritmo normal (unas 130 palabras por minuto), el texto hablado cabe en 5 minutos con margen
para las pausas.

## Antes de grabar

- [ ] Docker Desktop iniciado y laboratorio arriba: `.\scripts\iso-lab.ps1 -Iniciar` y luego
      `.\scripts\iso-lab.ps1 -Estado` hasta ver `Base lista: True`.
- [ ] Si pasó más de una semana desde la última evaluación, adelantar la revisión semanal (madurez 4):
      `.\scripts\ejecutar-sql.ps1 sql\mantenimiento\M02-revision-semanal.sql -Como sys -Salida evidencia\mantenimiento`.
- [ ] App abierta: dentro de `app/`, `npx vite preview --port 4173`; navegador en `http://localhost:4173`, modo claro,
      zoom al 110-125 % para que se lea en el video.
- [ ] Una terminal de PowerShell en la carpeta del proyecto, con letra grande, lista para el bloque 5.
- [ ] Tener abiertas en pestañas las direcciones de cada bloque (columna "Pantalla").
- [ ] Ensayar una vez con cronómetro.

## 1. El problema (0:00-0:30)

**Pantalla:** `http://localhost:4173/#/resumen?fase=antes`

- Soy Adrián Fernández, del curso de Administración de Bases de Datos.
- Este es un evaluador del riesgo de confidencialidad para Oracle.
- El cliente es una cooperativa ficticia.
- Guarda cédulas, salarios y tarjetas de 200 clientes.
- Su riesgo de confidencialidad es 4, alto.
- La administración quiere bajarlo a 2.
- Les muestro cómo lo logré y cómo lo demuestro.

## 2. Los tres mundos y la matriz (0:30-1:30)

**Pantalla:** `#/riesgos?fase=antes` (unos 20 s), luego `#/matriz?fase=antes&control=A5.18` con el panel abierto.

- Para bajar ese riesgo uní tres mundos.
- El administrativo: la norma ISO 27001 y el control interno.
- El de base de datos: las tareas del DBA.
- Y el de las herramientas de Oracle, que dan la evidencia.
- Primero identifiqué cinco factores de riesgo, con impacto y probabilidad.
- Luego construí esta matriz. Cada fila une los tres mundos.
- *(Señalar la fila A5.18.)* La tarea: gestión de usuarios.
- El riesgo: cuentas sin control.
- El control: A5.18, derechos de acceso.
- El criterio, de 0 a 4. Aquí está en 1.
- La evidencia: este script SQL y su salida real. *(Señalar el panel.)*
- Y el estado: Parcial.
- Nada de esto es una opinión: lo calcula el script.

## 3. El ataque "antes" (1:30-2:30)

**Pantalla:** `#/pruebas?fase=antes&prueba=P01`, luego `#/pruebas?fase=antes&prueba=P09`.

- El laboratorio ya está corregido.
- Por eso el "antes" lo muestro con la evidencia guardada de esa corrida.
- Para cada control escribí una prueba que intenta el ataque.
- *(P01 abierta.)* La exfuncionaria María Rojas ya no trabaja en la cooperativa.
- Pero su cuenta seguía abierta.
- Inició sesión y leyó los 200 clientes. *(Señalar "200" en la salida.)*
- *(Abrir P09.)* Esta prueba busca un dato dentro del archivo de la base.
- Como haría alguien que copia el disco.
- Encontró el texto en claro: tres coincidencias.
- Antes de corregir, ninguna de las 19 pruebas resistió el ataque.

## 4. Los controles aplicados (2:30-3:30)

**Pantalla:** `#/mapeo?fase=despues` (bajar hasta A5.18 y A8.24), luego `#/metodologia?fase=despues`.

**Comando (opcional, para mostrar un script real):**
`Get-Content sql\correccion\C05-identidades-perfiles.sql | Select-String mrojas`

- Seguí el ciclo PHVA.
- Planificar: el escenario y los riesgos.
- Hacer: quince scripts de corrección, de C01 a C15.
- *(Señalar el mapeo.)* Por ejemplo, la cuenta de la exfuncionaria quedó bloqueada y sin privilegios.
- Los datos del negocio quedaron cifrados con TDE.
- La aplicación perdió el rol DBA.
- Las cédulas y tarjetas se enmascaran con Data Redaction.
- Y cada analista solo ve los clientes de su cartera, con VPD.
- Verificar: dieciocho scripts y diecinueve pruebas, antes y después.
- Actuar: una revisión semanal programada en la base.
- Todo corre con scripts, sin pasos manuales.

## 5. La evaluación "después" (3:30-4:30)

**Pantalla:** `#/matriz?fase=despues&control=A5.18`, luego la terminal, luego `#/pruebas?fase=despues&prueba=P01`.

**Comando (en vivo):**
`.\scripts\ejecutar-sql.ps1 sql\pruebas\P01-exfuncionaria.sql -Como usuario:MROJAS -Salida salidas`

Salida esperada: `ORA-28000: The account is locked.` (la salida va a `salidas/`, que no se versiona, para no tocar la
evidencia).

- *(Matriz en "Después".)* La misma fila A5.18 ahora está en Cumple.
- Madurez 4: aplicado, documentado y verificado.
- Ahora repito el ataque en vivo, contra la base real.
- *(Correr el comando.)* Intento entrar como la exfuncionaria.
- ORA-28000: la cuenta está bloqueada.
- No obtiene ningún dato.
- *(Volver a la app, P01 en "Después".)* Es el mismo resultado que guardó la evaluación.
- Y así con las 19 pruebas: las 19 resisten el ataque.

## 6. Cierre (4:30-5:00)

**Pantalla:** `#/resumen?fase=despues`; cambiar una vez a "Antes" y volver a "Después".

- El riesgo de confidencialidad pasó de 4 a 2.
- Era la meta de la administración.
- 16 de 17 controles cumplen.
- El de parcheo queda parcial: Oracle XE no recibe parches, y ese riesgo se aceptó formalmente.
- Cada resultado tiene su script y su evidencia.
- Todo está en el repositorio, para que cualquiera lo repita.
- Gracias.
