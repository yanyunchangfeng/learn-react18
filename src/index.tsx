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
} from "react";
import { createRoot } from "react-dom/client";
import React from "react";
import { flushSync, createPortal } from "react-dom";
import { Button, Input, InputNumber } from "antd";
document.body.innerHTML = '<div id= "app" ></div>';
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
const MyButton = forwardRef<IInputRef, {}>((props, ref) => {
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
const App = () => {
  const inputRef = useRef<IInputRef>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [isPending, startTransition] = useTransition();
  const [num, setNum] = useState(0);
  const [multiples, setMultiples] = useState<JSX.Element[]>([]);
  // useInsertionEffect
  useCss(".black{background:black}");
  const [isPrinting, setIsPrinting] = useState(false);
  // 模拟useDeferredValue的实现
  const [value, setValue] = useState("");
  const [deferredValue, setDeferredValue] = useState("");
  useEffect(() => {
    startTransition(() => {
      setDeferredValue(query);
    });
  }, [query, startTransition]);
  // flushSync
  useEffect(() => {
    function handleBeforePrint(e: Event) {
      flushSync(() => {
        setIsPrinting(true);
      });
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
  const onChange = (value: number | null) => {
    setNum(Number(value));
  };
  useEffect(() => {
    if (num > 0) {
      generateMultiples(num);
    }
  }, [num]);
  return (
    <>
      <Input
        className="query"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <InputNumber value={num} onChange={onChange} />
      <h1>is Printing {isPrinting ? "yes" : "no"}</h1>
      <Button onClick={window.print}>print</Button>
      {/* <LongList value={deferredQuery} />  下面是useDeferredValue的模拟实现*/}
      <LongList value={deferredValue} />
      <MyButton ref={inputRef} />
      {isPending ? "loading" : multiples}
      {/* {createPortal(<Button>createPortal</Button>, document.body)} react-test-render not support for portal*/}
    </>
  );
};
const root = createRoot(document.getElementById("app")!);
root.render(<App />);

export { App };
