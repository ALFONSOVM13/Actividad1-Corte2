const express = require('express');
const fs = require('fs');
const app = express();
const port = 5000;

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.redirect('/formulario');
});

app.get('/formulario', (req, res) => {
  const savedFormValues = req.query; // Recupera valores de campos de la consulta
  res.sendFile(__dirname + '/public/form.html', {
    formValues: savedFormValues // Pasa los valores recuperados a la plantilla HTML
  });
});

app.post('/prestamo', (req, res) => {
  const { id, nombre, apellido, titulo, autor, editorial, año } = req.body;

  if (!id || !nombre || !apellido || !titulo || !autor || !editorial || !año) {
    // Redirige a la página de error pasando los valores del formulario en la URL
    const queryParams = new URLSearchParams(req.body).toString();
    return res.redirect(`/error?${queryParams}`);
  }

  const contenido = `${id}, ${nombre}, ${apellido}, ${titulo}, ${autor}, ${editorial}, ${año}`;
  const archivoNombre = `data/id_${id}.txt`;

  fs.writeFile(archivoNombre, contenido, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error interno del servidor.');
    }

    // Envía una página HTML con el mensaje de éxito y un botón para recargar
    res.send(`
      <html>
        <head>
          <link rel="stylesheet" type="text/css" href="/styles.css">
        </head>
        <body>
          <div class="success-message">
            Préstamo creado con éxito.
          </div>
          <a href="/" class="reload-button">Recargar la página</a>
        </body>
      </html>
    `);
  });
});

app.get('/error', (req, res) => {
  const savedFormValues = req.query; // Recupera valores de campos de la consulta
  res.sendFile(__dirname + '/public/error.html', {
    formValues: savedFormValues // Pasa los valores recuperados a la plantilla HTML
  });
});

app.get('/descargar/:id', (req, res) => {
  const id = req.params.id;
  const archivoNombre = `data/id_${id}.txt`;

  if (fs.existsSync(archivoNombre)) {
    res.download(archivoNombre, (err) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error al descargar el archivo.');
      }
    });
  } else {
    res.status(404).send('El archivo no existe.');
  }
});

app.listen(port, () => {
  console.log(`Servidor en ejecución en http://localhost:${port}`);
});
