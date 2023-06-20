import {
  FC,
  forwardRef,
  useEffect,
  useInsertionEffect,
  useRef,
  useLayoutEffect,
  useState,
  useDeferredValue,
  memo,
  useImperativeHandle,
  useTransition,
  ChangeEvent,
} from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import { flushSync } from "react-dom";
document.body.innerHTML = '<div id= "app"></div>';
let isInserted = new Set();
const getStyleForRule = (rule: string) => {
  let style = document.createElement("style");
  style.innerHTML = `${rule}`;
  return style;
};
const useCss = (rule: string) => {
  useInsertionEffect(() => {
    let style: HTMLStyleElement;
    if (!isInserted.has(rule)) {
      isInserted.add(rule);
      style = getStyleForRule(rule);
      document.head.appendChild(style);
    }
    return () => {
      document.head.removeChild(style);
    };
  }, []);
};
interface IInputRef {
  focus: () => void;
  ss: () => void;
}
const Button = forwardRef<IInputRef, {}>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(
    ref,
    () => {
      return {
        focus() {
          inputRef.current!.focus();
        },
        ss() {
          console.log("Button ss method call");
        },
      };
    },
    []
  );
  return <input type="text" ref={inputRef} />;
});
const LongList: FC<{ value: string }> = memo(({ value }) => {
  useLayoutEffect(() => {
    // 浏览器渲染前移除大量的 dom 节点，排除浏览器渲染大量节点的影响
    var container = document.getElementsByClassName("container");
    var list = document.getElementsByClassName("list");
    if (list.length) {
      container[0].removeChild(list[0]);
    }
  });

  return (
    <div className="container">
      {Array(100)
        .fill("a")
        .map((item, index) => (
          <div key={item + index}>{value}</div>
        ))}
      <div className="list">
        {Array(50000)
          .fill("b")
          .map((item, index) => (
            <div key={item + index}>{value}</div>
          ))}
      </div>
    </div>
  );
});
const App: FC = () => {
  const inputRef = useRef<IInputRef>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [isPending, startTransition] = useTransition();
  const [num, setNum] = useState(0);
  const [multiples, setMultiples] = useState<JSX.Element[]>([]);
  // useInsertionEffect
  useCss(".black{background:black}");
  const [isPrinting, setIsPrinting] = useState(false);
  // flushSync
  useEffect(() => {
    function handleBeforePrint() {
      flushSync(() => {
        setIsPrinting(true);
        console.log(isPrinting);
      });
      console.log(isPrinting);
    }

    function handleAfterPrint() {
      setIsPrinting(false);
    }

    window.addEventListener("beforeprint", handleBeforePrint);
    window.addEventListener("afterprint", handleAfterPrint);
    return () => {
      window.removeEventListener("beforeprint", handleBeforePrint);
      window.removeEventListener("afterprint", handleAfterPrint);
    };
  }, []);
  // useImperativeHandle
  // useEffect(() => {
  //   console.log(inputRef.current?.focus());
  //   console.log(inputRef.current?.ss());
  // }, []);
  // useDeferredValue
  // useEffect(() => {
  //   console.log("query", query);
  //   console.log("deferredQuery", deferredQuery);
  // });

  // startTransition
  const generateMultiples = (num: number) => {
    startTransition(() => {
      //不用setTransition 当num数值改变后页面渲染直接卡死
      setMultiples(
        Array.from(Array(100000).keys()).map((i) => (
          <div key={i}>{num * (i + 1)}</div>
        ))
      );
    });
  };
  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNum(Number(e.target.value));
  };
  useEffect(() => {
    if (num > 0) {
      generateMultiples(num);
    }
  }, [num]);
  return (
    <>
      <label>
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <label>
        <input value={num} type="number" onChange={onChange} />
      </label>
      <h1>is Printing {isPrinting ? "yes" : "no"}</h1>
      <button onClick={window.print}>print</button>
      <LongList value={deferredQuery} />
      <Button ref={inputRef} />
      {isPending ? "loading" : multiples}
    </>
  );
};
const root = createRoot(document.getElementById("app")!);
root.render(<App />);
