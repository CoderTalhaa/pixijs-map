import { Application, Assets, Sprite, Text, Graphics } from "pixi.js";
import { initDevtools } from "@pixi/devtools";
import { Viewport } from "pixi-viewport";

(async () => {
  // Step 2
  const app = new Application();

  // Step 3
  await app.init({
    resizeTo: window,
    antialias: true,
    backgroundColor: "0xffffff",
  });

  initDevtools({
    app,
  });

  app.canvas.style.position = "absolute";
  document.body.appendChild(app.canvas);

  //! main logic from below

  const WORLD_WIDTH = 3383;
  const WORLD_HEIGHT = 1358;

  const loaderContainer = new Graphics();
  loaderContainer.fill(0x000000); // Semi-transparent black background
  loaderContainer.rect(0, 0, app.screen.width, app.screen.height);
  app.stage.addChild(loaderContainer);

  const loadingText = new Text({
    text: "Loading...",
    fontFamily: "Arial",
    fontSize: 32,
    fill: 0xffffff,
    align: "center",
  });
  loadingText.anchor.set(0.5);
  loadingText.x = app.screen.width / 2;
  loadingText.y = app.screen.height / 2;
  app.stage.addChild(loadingText);

  const viewport = new Viewport({
    screenWidth: app.canvas.width,
    screenHeight: app.canvas.height,
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    events: app.renderer.events,
  });

  app.stage.addChild(viewport);

  viewport
    .drag({ factor: 0.8 }) // Adjust drag speed; lower is slower
    .pinch({ percent: 2 }) // Adjust pinch speed; higher percent slows it down
    .wheel({ percent: 0.2 }) // Adjust wheel zoom speed
    .decelerate({ friction: 0.9 }) // Adjust deceleration; higher is slower
    .clampZoom({
      minScale: 1, // Minimum zoom level
      maxScale: 2, // Maximum zoom level
    })
    .clamp({
      left: true, // Restrict left panning
      right: true, // Restrict right panning
      top: true, // Restrict top panning
      bottom: true, // Restrict bottom panning
      direction: "all",
      underflow: "center",
    });
  viewport.fit();
  viewport.moveCenter(WORLD_WIDTH / 2, WORLD_HEIGHT / 2);

  const borderLine = new Graphics();

  borderLine
    .stroke(10, 0xff0000) // Red line with specified width
    .rect(0, 0, viewport.worldWidth, viewport.worldHeight);

  viewport.addChild(borderLine);

  console.log(viewport.worldHeight, viewport.worldWidth);
  console.log("Border Line:", borderLine.getBounds());

  //! iamge loader below
  const imagePromise = Assets.load("/img/crop-map.png");

  imagePromise.then((resolvedImage) => {
    const image = Sprite.from(resolvedImage);
    image.width = WORLD_WIDTH;
    image.height = WORLD_HEIGHT;
    viewport.addChild(image);

    app.stage.removeChild(loaderContainer);
  });

  imagePromise.catch((error) => {
    console.error("Error loading the map image:", error);
    loadingText.text = "Failed to load the map. Please try again.";
  });
})();
