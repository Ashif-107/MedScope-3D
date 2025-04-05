const viewer = document.getElementById("viewer");

let pitch = 0; // X-axis
let yaw = 0;   // Y-axis
let roll = 0;  // Z-axis

const updateRotation = () => {
  viewer.orientation = `${pitch}deg ${yaw}deg ${roll}deg`;
};

document.addEventListener("keydown", (e) => {
  const step = 5;

  switch (e.key.toLowerCase()) {
    case "w":
      yaw -= step;
      break;
    case "s":
      yaw += step;
      break;
    case "a":
      roll -= step;
      break;
    case "d":
      roll += step;
      break;
  }

  updateRotation();
});