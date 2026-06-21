const ZERO_MOVE = Object.freeze({ x: 0, y: 0, z: 0 });
const DEFAULT_CAMERA_FORWARD = Object.freeze({ x: 0, y: 0, z: -1 });

export function normalizeAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

export function shortestAngleDelta(current, target) {
  return normalizeAngle(target - current);
}

export function smoothAngleToward(current, target, alpha) {
  const clampedAlpha = Math.max(0, Math.min(1, alpha));
  return normalizeAngle(current + shortestAngleDelta(current, target) * clampedAlpha);
}

export function normalizePlanarVector(vector, fallback = ZERO_MOVE) {
  const x = Number.isFinite(vector?.x) ? vector.x : 0;
  const z = Number.isFinite(vector?.z) ? vector.z : 0;
  const length = Math.hypot(x, z);

  if (length <= 0.000001) {
    return { x: fallback.x || 0, y: 0, z: fallback.z || 0 };
  }

  return { x: x / length, y: 0, z: z / length };
}

export function cameraMovementBasis(cameraForward) {
  const forward = normalizePlanarVector(cameraForward, DEFAULT_CAMERA_FORWARD);
  return {
    forward,
    right: { x: -forward.z, y: 0, z: forward.x }
  };
}

export function createCameraRelativeMove(input, cameraForward) {
  const forwardAmount = Number(input?.forward || 0);
  const strafeAmount = Number(input?.strafe || 0);

  if (forwardAmount === 0 && strafeAmount === 0) {
    return ZERO_MOVE;
  }

  const basis = cameraMovementBasis(cameraForward);
  return normalizePlanarVector(
    {
      x: basis.forward.x * forwardAmount + basis.right.x * strafeAmount,
      z: basis.forward.z * forwardAmount + basis.right.z * strafeAmount
    },
    ZERO_MOVE
  );
}

export function visualYawForMoveDirection(moveDirection, modelForwardZ = -1) {
  const direction = normalizePlanarVector(moveDirection, ZERO_MOVE);
  if (direction.x === 0 && direction.z === 0) return 0;

  return modelForwardZ < 0 ? Math.atan2(-direction.x, -direction.z) : Math.atan2(direction.x, direction.z);
}
