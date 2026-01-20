const fs = require('fs');
	
	// Cargar datos
	let tasks = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

	// Crear una nueva tarea
	app.post('/tasks', (req, res) => {
  		const newTask = req.body;
  		tasks.push(newTask);
  		fs.writeFileSync('data.json', JSON.stringify(tasks, null, 2));
  		res.status(201).send(newTask);
	});

	// Obtener todas las tareas
	app.get('/tasks', (req, res) => {
		res.send(tasks);
	});

	// Actualizar una tarea
	app.put('/tasks/:id', (req, res) => {
		const id = req.params.id;
		tasks[id] = req.body;
		fs.writeFileSync('data.json', JSON.stringify(tasks, null, 2));
		res.send(tasks[id]);
	});

	// Eliminar una tarea
	app.delete('/tasks/:id', (req, res) => {
		tasks.splice(req.params.id, 1);
		fs.writeFileSync('data.json', JSON.stringify(tasks, null, 2));
		res.status(204).send();
	});