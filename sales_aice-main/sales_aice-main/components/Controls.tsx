"use client";
import { useVoice } from "@humeai/voice-react";
import { Button } from "./ui/button";
import { Mic, MicOff, Phone } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Toggle } from "./ui/toggle";
import MicFFT from "./MicFFT";
import { cn } from "@/utils";

export default function Controls() {
  const { disconnect, status, isMuted, unmute, mute, micFft } = useVoice();

  return (
    <div
      className={
        cn(
          "w-full flex justify-center px-2 sm:px-4"
        )
      }
    >
      <AnimatePresence>
        {status.value === "connected" ? (

          <motion.div
            initial={{
              y: "100%",
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: "100%",
              opacity: 0,
            }}
            className={
              "w-full max-w-xs sm:max-w-md p-2 sm:p-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 bg-transparent"
            }
          >
            <Toggle
              className={"rounded-full"}
              pressed={!isMuted}
              onPressedChange={() => {
                if (isMuted) {
                  unmute();
                } else {
                  mute();
                }
              }}
            >
              {isMuted ? (
                <MicOff className={"size-4"} />
              ) : (
                <Mic className={"size-4"} />
              )}
            </Toggle>

            <div className={"relative grid h-8 w-48 shrink grow-0"}>
              <MicFFT fft={micFft} className={"fill-current w-full h-full"} />
            </div>

            <Button
              className={"flex items-center gap-1 rounded-full w-full sm:w-auto justify-center"}
              onClick={() => {
                disconnect();
              }}
              variant={"destructive"}
            >
              <span>
                <Phone
                  className={"size-4 opacity-50 fill-current"}
                  strokeWidth={0}
                />
              </span>
              <span>End Call</span>
            </Button>
          </motion.div>

        ) : null}
      </AnimatePresence>
    </div>
  );
}
