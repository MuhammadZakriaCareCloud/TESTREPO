"use client";

import { VoiceProvider } from "@humeai/voice-react";
import Messages from "./Messages";
import Controls from "./Controls";
import StartCall from "./StartCall";
import { ComponentRef, useRef } from "react";
import { toast } from "sonner";

export default function ClientComponent({
  // accessToken,
}: {
  // accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);

  // optional: use configId from environment variable
  // const configId = process.env['NEXT_PUBLIC_HUME_CONFIG_ID'];

  return (
    <div
      className={
        ""
      }
    >
      <VoiceProvider
        onMessage={() => {
          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          // timeout.current = window.setTimeout(() => {
          //   if (ref.current) {
          //     const scrollHeight = ref.current.scrollHeight;

          //     ref.current.scrollTo({
          //       top: scrollHeight,
          //       behavior: "smooth",
          //     });
          //   }
          // }, 200);
        }}
        onError={(error) => {
          toast.error(error.message);
        }}
      >

          <div className="p-1 rounded-2xl  flex flex-col items-center justify-center text-center ">
            {/* <video
              className="w-full max-w-md pb-5"
              autoPlay
              loop
              muted
              playsInline
            >
              <source src="/output_transparent.webm" type="video/webm" />
              Your browser does not support the video tag.
            </video> */}
            <img
              src="Logingif.gif"
              alt="Animated GIF"
              className="w-full h-auto pb-2 object-contain"
            />
            {/* <Messages ref={ref} /> */}
            <Controls />
            <StartCall/>
          </div>
      </VoiceProvider>
    </div>
  );
}
