import { onBeforeUnmount, onMounted, reactive } from 'vue';

export interface Options {
  element: string | Element;
  target: string | Element;
  className?: string;
}

export default function useSticky(options: Options) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      const { className = 'sticking', element: ele } = options;
      const element =
        typeof ele === 'string' ? document.querySelector(ele) : ele;
      if (!entry.isIntersecting) {
        element?.classList.add(className);
      } else {
        element?.classList.remove(className);
      }
    },
    { threshold: 0.01 }
  );

  onMounted(() => {
    observe();
  });

  onBeforeUnmount(() => {
    unobserve();
  });

  function observe(_target?: Element | string) {
    const tgt = _target || options.target;
    const target = typeof tgt === 'string' ? document.querySelector(tgt) : tgt;
    target && observer.observe(target);
  }

  function unobserve(_target?: Element | 'string') {
    const tgt = _target || options.target;
    const target = typeof tgt === 'string' ? document.querySelector(tgt) : tgt;
    target && observer.unobserve(target);
  }

  return { observe, unobserve };
}
