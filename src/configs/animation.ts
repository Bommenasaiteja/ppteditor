import type { TurningMode } from '@/types/slides'

export const ANIMATION_DEFAULT_DURATION = 1000
export const ANIMATION_DEFAULT_TRIGGER = 'click'
export const ANIMATION_CLASS_PREFIX = 'animate__'

export const ENTER_ANIMATIONS = [
  {
    type: 'bounce',
    name: 'Bounce',
    children: [
      { name: 'bounceIn', value: 'bounceIn' },
      { name: 'bounce right', value: 'bounceInLeft' },
      { name: 'bounce to the left', value: 'bounceInRight' },
      { name: 'bounce up', value: 'bounceInUp' },
      { name: 'bounce down', value: 'bounceInDown' },
    ],
  },
  {
    type: 'fade',
    name: 'Emerge',
    children: [
      { name: 'Float', value: 'fadeIn' },
      { name: 'Float down', value: 'fadeInDown' },
      { name: 'Fade downward long distance', value: 'fadeInDownBig' },
      { name: 'Float right', value: 'fadeInLeft' },
      { name: 'Fade long to the right', value: 'fadeInLeftBig' },
      { name: 'Float to the left', value: 'fadeInRight' },
      { name: 'Float long to the left', value: 'fadeInRightBig' },
      { name: 'Float up', value: 'fadeInUp' },
      { name: 'fadeInUpBig', value: 'fadeInUpBig' },
      { name: 'Float from top left', value: 'fadeInTopLeft' },
      { name: 'Float from top right', value: 'fadeInTopRight' },
      { name: 'Float in from bottom left', value: 'fadeInBottomLeft' },
      { name: 'Float from bottom right', value: 'fadeInBottomRight' },
    ],
  },
  {
    type: 'rotate',
    name: 'rotate',
    children: [
      { name: 'rotateIn', value: 'rotateIn' },
      { name: 'Enter around the lower left', value: 'rotateInDownLeft' },
      { name: 'Rotate around the lower right', value: 'rotateInDownRight' },
      { name: 'Enter around the upper left', value: 'rotateInUpLeft' },
      { name: 'Enter around the upper right', value: 'rotateInUpRight' },
    ],
  },
  {
    type: 'zoom',
    name: 'Zoom',
    children: [
      { name: 'zoom in', value: 'zoomIn' },
      { name: 'Zoom down to enter', value: 'zoomInDown' },
      { name: 'Zoom in from the left', value: 'zoomInLeft' },
      { name: 'Zoom in from the right', value: 'zoomInRight' },
      { name: 'Zoom up and enter', value: 'zoomInUp' },
    ],
  },
  {
    type: 'slide',
    name: 'Slide in',
    children: [
      { name: 'Slide down', value: 'slideInDown' },
      { name: 'Slide in from right', value: 'slideInLeft' },
      { name: 'Slide in from left', value: 'slideInRight' },
      { name: 'Slide up', value: 'slideInUp' },
    ],
  },
  {
    type: 'flip',
    name: 'flip',
    children: [
      { name: 'X-axis flip into', value: 'flipInX' },
      { name: 'Y-axis flip into', value: 'flipInY' },
    ],
  },
  {
    type: 'back',
    name: 'Magnify slide in',
    children: [
      { name: 'Scroll down to zoom in', value: 'backInDown' },
      { name: 'Scale in from left', value: 'backInLeft' },
      { name: 'Scroll in from right', value: 'backInRight' },
      { name: 'Scale up to zoom in', value: 'backInUp' },
    ],
  },
  {
    type: 'lightSpeed',
    name: 'fly in',
    children: [
      { name: 'Fly in from the right', value: 'lightSpeedInRight' },
      { name: 'Fly in from the left', value: 'lightSpeedInLeft' },
    ],
  },
]

export const EXIT_ANIMATIONS = [
  {
    type: 'bounce',
    name: 'Bounce',
    children: [
      { name: 'bounceOut', value: 'bounceOut' },
      { name: 'bounceOutLeft', value: 'bounceOutLeft' },
      { name: 'bounce right', value: 'bounceOutRight' },
      { name: 'bounceOutUp', value: 'bounceOutUp' },
      { name: 'Bounce Down', value: 'bounceOutDown' },
    ],
  },
  {
    type: 'fade',
    name: 'Emerge',
    children: [
      { name: 'fadeOut', value: 'fadeOut' },
      { name: 'fade down', value: 'fadeOutDown' },
      { name: 'fadeOutDownBig', value: 'fadeOutDownBig' },
      { name: 'fade to the left', value: 'fadeOutLeft' },
      { name: 'fadeOutLeftBig', value: 'fadeOutLeftBig' },
      { name: 'fade to the right', value: 'fadeOutRight' },
      { name: 'fadeOutRightBig', value: 'fadeOutRightBig' },
      { name: 'fade up', value: 'fadeOutUp' },
      { name: 'fadeOutUpBig', value: 'fadeOutUpBig' },
      { name: 'Float from top left', value: 'fadeOutTopLeft' },
      { name: 'Fade from top right', value: 'fadeOutTopRight' },
      { name: 'Fade from bottom left', value: 'fadeOutBottomLeft' },
      { name: 'Fade from bottom right', value: 'fadeOutBottomRight' },
    ],
  },
  {
    type: 'rotate',
    name: 'rotate',
    children: [
      { name: 'rotateOut', value: 'rotateOut' },
      { name: 'rotateOutDownLeft', value: 'rotateOutDownLeft' },
      { name: 'rotateOutDownRight', value: 'rotateOutDownRight' },
      { name: 'Exit around the upper left', value: 'rotateOutUpLeft' },
      { name: 'rotateOutUpRight', value: 'rotateOutUpRight' },
    ],
  },
  {
    type: 'zoom',
    name: 'Zoom',
    children: [
      { name: 'zoomout', value: 'zoomOut' },
      { name: 'Zoom down and exit', value: 'zoomOutDown' },
      { name: 'Zoom out from the left to exit', value: 'zoomOutLeft' },
      { name: 'Zoom out from the right', value: 'zoomOutRight' },
      { name: 'Zoom up and exit', value: 'zoomOutUp' },
    ],
  },
  {
    type: 'slide',
    name: 'Slide out',
    children: [
      { name: 'slide out', value: 'slideOutDown' },
      { name: 'Slide out from the left', value: 'slideOutLeft' },
      { name: 'Slide out from the right', value: 'slideOutRight' },
      { name: 'slide up', value: 'slideOutUp' },
    ],
  },
  {
    type: 'flip',
    name: 'flip',
    children: [
      { name: 'X-axis flip out', value: 'flipOutX' },
      { name: 'Y-axis flip out', value: 'flipOutY' },
    ],
  },
  {
    type: 'back',
    name: 'Shrink out',
    children: [
      { name: 'Scroll down and slide out', value: 'backOutDown' },
      { name: 'Scroll out from the left', value: 'backOutLeft' },
      { name: 'Scroll out from the right', value: 'backOutRight' },
      { name: 'Scroll out and shrink up', value: 'backOutUp' },
    ],
  },
  {
    type: 'lightSpeed',
    name: 'fly out',
    children: [
      { name: 'Fly out from the right', value: 'lightSpeedOutRight' },
      { name: 'Fly out from the left', value: 'lightSpeedOutLeft' },
    ],
  },
]

export const ATTENTION_ANIMATIONS = [
  {
    type: 'shake',
    name: 'shaking',
    children: [
      { name: 'Shake left and right', value: 'shakeX' },
      { name: 'Shake up and down', value: 'shakeY' },
      { name: 'headShake', value: 'headShake' },
      { name: 'swing', value: 'swing' },
      { name: 'wobble', value: 'wobble' },
      { name: 'fright', value: 'tada' },
      { name: 'jelly', value: 'jello' },
    ],
  },
  {
    type: 'other',
    name: 'Other',
    children: [
      { name: 'bounce', value: 'bounce' },
      { name: 'flash', value: 'flash' },
      { name: 'pulse', value: 'pulse' },
      { name: 'rubber band', value: 'rubberBand' },
      { name: 'Heartbeat (fast)', value: 'heartBeat' },
    ],
  },
]

interface SlideAnimation {
  label: string
  value: TurningMode
}

export const SLIDE_ANIMATIONS: SlideAnimation[] = [
  { label: 'None', value: 'no' },
  { label: 'random', value: 'random' },
  { label: 'Slide left and right', value: 'slideX' },
  { label: 'Slide up and down', value: 'slideY' },
  { label: 'Slide left and right (3D)', value: 'slideX3D' },
  { label: 'Slide up and down (3D)', value: 'slideY3D' },
  { label: 'fade', value: 'fade' },
  { label: 'rotate', value: 'rotate' },
  { label: 'Expand up and down', value: 'scaleY' },
  { label: 'Expand left and right', value: 'scaleX' },
  { label: 'zoom in', value: 'scale' },
  { label: 'scaleReverse', value: 'scaleReverse' },
]
