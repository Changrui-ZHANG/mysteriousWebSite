
// Field & Camera
export const FIELD_WIDTH = 10;
export const FIELD_DEPTH = 60;
export const FRONT_WALL_Z = 15;
export const BACK_WALL_Z = -65;
export const WALL_Z = 5;
export const WALL_MAX_HP = 1000;
export const WALL_DAMAGE = 5;
export const WALL_ATTACK_COOLDOWN = 1.0;

// Player
export const PLAYER_SPEED = 0.3;
export const PROJECTILE_SPEED = 0.8;

// Zombies
// Zombies
export const ZOMBIE_BASE_SPEED = 0.02;

// Controls
export const GHOST_CLICK_DELAY = 500; // ms to ignore mouse after touch
export const TOUCH_DEADZONE = 0.05; // Normalized screen width
export const TOUCH_SENSITIVITY = 2.5; // Multiplier for analog control
export const MOUSE_LERP_FACTOR = 0.2; // Smoothing for PC mouse
export const KNOCKBACK_FORCE = 0.5; // Meters to push back
export const KNOCKBACK_RESISTANCE = { walker: 1, runner: 0.8, tank: 0.2, boss: 0.1 }; // Multiplier
