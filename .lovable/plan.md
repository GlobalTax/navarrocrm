

## Plan: Actualizar datos reales de los 53 usuarios

### Problema
El array `PRELOADED_USERS` en `src/components/users/UserBulkPreloaded.tsx` (lineas 38-92) contiene datos inventados. Hay que reemplazarlo con los datos reales proporcionados del equipo NRRO.

### Cambio
Reemplazar el array `PRELOADED_USERS` (lineas 38-92) con los 54 usuarios reales:

```
Adrián Montero - a.montero@nrro.es
Adrián Muñoz - a.munoz@nrro.es
Alba Virto - a.virto@nrro.es
Alberto Vicente - a.vicente@nrro.es
Aleix Miró - a.miro@nrro.es
Alejandro Brotons - a.brotons@nrro.es
Ana Ramírez - a.ramirez@nrro.es
Anabel Raso - a.raso@nrro.es
Angelo Martín - a.martin@nrro.es
Blanca Salvó - b.salvo@nrro.es
Carolina Sacco - c.sacco@nrro.es
Cinthia Paola Sánchez - cp.sanchez@nrro.es
Clara Bellonch - c.bellonch@nrro.es
Clara Giménez - c.gimenez@nrro.es
Claudia Martín - c.martin@nrro.es
David Gómez Rovira - d.gomez@nrro.es
Eric Abellán - e.abellan@nrro.es
Estel Borrell - e.borrell@nrro.es
Gemma Zalacain - g.zalacain@nrro.es
Gerard Iriarte - g.iriarte@nrro.es
Irene Velarde - i.velarde@nrro.es
Iván Rodríguez Ruiz - I.Rodriguez@nrro.es
Joan Salvó - j.salvo@nrro.es
Jordi Majoral - j.majoral@nrro.es
Jose Bonet - j.bonet@nrro.es
José María Argüello - jm.arguello@nrro.es
Juan Luis Dambrosio - jl.dambrosio@nrro.es
Júlia Estellé - j.estelle@nrro.es
Laia Moll - l.moll@nrro.es
Lluís Montanya - ll.montanya@nrro.es
Lucia Linares - L.linares@nrro.es
Magdalena Vidueira - m.vidueira@nrro.es
Marc Canet - m.canet@nrro.es
María León - m.leon@nrro.es
María Ventín - m.ventin@nrro.es
Mía Fernández - m.fernandez@nrro.es
Mónica Castro - m.castro@nrro.es
Nil Moreno - n.moreno@nrro.es
Oriol Morón - o.moron@nrro.es
Pau Valls - p.valls@nrro.es
Paula Cárdenas - p.cardenas@nrro.es
Pepe Rico - p.rico@nrro.es
Pilar D'Ambrosio - p.dambrosio@nrro.es
Pol Fontclara - p.fontclara@nrro.es
Queralt Vall - q.vall@nrro.es
Raquel Chica - r.chica@nrro.es
Raul Rubio - r.rubio@nrro.es
Roc Serra - r.serra@nrro.es
Rosa Rodríguez - r.rodriguez@nrro.es
Sara Alonso - s.alonso@nrro.es
Sara Sanz - s.sanz@nrro.es
Vasyl Lenko - v.lenko@nrro.es
Yasmina Aguilera - y.aguilera@nrro.es
Yolanda Pescador - y.pescador@nrro.es
Yuxiang Huang - y.huang@nrro.es
```

### Archivo afectado
- `src/components/users/UserBulkPreloaded.tsx` — solo se reemplaza el array de datos (lineas 38-92), el resto del componente no cambia.

