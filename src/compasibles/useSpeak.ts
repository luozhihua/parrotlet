import { useSpeechSynthesis } from '@vueuse/core';
import { ref, nextTick } from 'vue';

export default function useSpeak() {
  const text = ref('Hello World!');
  const language = ref('en-US');
  const voice = ref<SpeechSynthesisVoice>(
    null as unknown as SpeechSynthesisVoice
  );
  const speech = useSpeechSynthesis(text, {
    voice,
    lang: language,
    pitch: 1,
    rate: 1,
    volume: 1,
  });

  function matchLangs(lang1: string, lang2: string, strict = true) {
    if (lang1 && lang2) {
      [lang1, lang2] = [lang1, lang2].map((l) =>
        l.toLowerCase().replaceAll('_', '-')
      );
      const matched = strict
        ? lang1 === lang2
        : lang1.split('-')[0] === lang2.split('-')[0];
      return matched;
    } else {
      return false;
    }
  }

  function getVoiceService(lang: string) {
    if (speech.isSupported.value) {
      lang = lang.toLowerCase();
      const synth = window.speechSynthesis;
      const voices = synth.getVoices();
      const voi1 = voices.filter((v) => matchLangs(lang, v.lang));
      const voi2 = voices.filter((v) => matchLangs(lang, v.lang, false));
      return voi1[0] || voi2[0];
    } else {
      return null;
    }
  }

  function speak(txt: string, lang: string) {
    const svc = getVoiceService(lang);
    if (svc) {
      text.value = txt;
      language.value = lang;
      voice.value = svc;
      speech.speak();
    } else {
      voice.value = null as unknown as SpeechSynthesisVoice;
      console.error(`Voice service for ${lang} not found.`);
    }
  }

  return { matchLangs, voice, speak };
}
