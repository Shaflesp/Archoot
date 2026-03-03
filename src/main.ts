console.log('Fichier chargé!');

const canvas = document.querySelector<HTMLCanvasElement>('.gameCanvas')!,
	context = canvas.getContext('2d')!;

const image = new Image();
image.src = '/images/cobaye.png';
image.addEventListener('load', event => {
	context.drawImage(
		image,
		canvas.width / 2 - image.width / 2,
		canvas.height / 2 - image.height / 2
	);
});

/** À remplir... */
