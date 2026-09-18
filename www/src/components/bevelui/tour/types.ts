export type TourSide = "top" | "right" | "bottom" | "left";

/** How the tour ended — consumers previously could not tell these apart. */
export type TourEndReason = "completed" | "skipped" | "stopped";

export interface TourMedia {
  type: "video" | "gif" | "image";
  src: string;
  /** Video thumbnail shown before playback begins. */
  poster?: string;
  alt?: string;
}

export interface TourStepDef {
  id?: string;
  /** 1-based step index. */
  step: number;
  title: string;
  description: string;
  /** Preferred side for the card. Flips automatically near a viewport edge. */
  side?: TourSide;
  /** Distance from the anchor in px. */
  sideOffset?: number;
  /** Media shown above the title. */
  media?: TourMedia;
  /** Padding around the anchor highlight in px. */
  highlightPadding?: number;
  /**
   * Let the user click the highlighted element during this step. The cutout
   * becomes interactive and the overlay no longer dismisses on click, so a
   * step can ask the user to actually perform the action.
   */
  interactive?: boolean;
  /** Run before the step is shown — e.g. open a menu that holds the anchor. */
  beforeEnter?: () => void | Promise<void>;
}

export interface TourContextValue {
  steps: TourStepDef[];
  currentStep: number;
  totalSteps: number;
  isOpen: boolean;
  showOverlay: boolean;
  currentStepDef: TourStepDef | undefined;
  /** True while the anchor for the current step cannot be found in the DOM. */
  isAnchorMissing: boolean;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  goTo: (step: number) => void;
  skip: () => void;
}
