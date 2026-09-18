"use client";

import * as React from "react";
import { TourProvider, type TourProviderProps } from "./tour-context";
import { TourOverlay } from "./tour-overlay";
import { TourCard } from "./tour-card";

export interface TourRootProps extends Omit<TourProviderProps, "children"> {
  children: React.ReactNode;
  /** Class applied to the tour card. */
  cardClassName?: string;
}

/**
 * Composes Provider + Overlay + Card so a tour is a single import.
 *
 * @example
 * <TourRoot
 *   steps={steps}
 *   onComplete={() => markOnboarded()}
 *   onSkip={() => track("tour_skipped")}
 * >
 *   <App />
 * </TourRoot>
 */
export function TourRoot({
  children,
  cardClassName,
  ...providerProps
}: TourRootProps) {
  return (
    <TourProvider {...providerProps}>
      {children}
      <TourOverlay />
      <TourCard className={cardClassName} />
    </TourProvider>
  );
}

TourRoot.displayName = "TourRoot";
