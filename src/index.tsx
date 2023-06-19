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
} from "react";
import { createRoot } from "react-dom/client";
import React from "react";
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
  useCss(".black{background:black}");
  useEffect(() => {
    console.log(inputRef.current?.focus());
    console.log(inputRef.current?.ss());
  }, []);
  useEffect(() => {
    // console.log("query", query);
    // console.log("deferredQuery", deferredQuery);
  });
  return (
    <>
      <label>
        Search albums:
        <input value={query} onChange={(e) => setQuery(e.target.value)} />
      </label>
      <LongList value={deferredQuery} />
      <Button ref={inputRef} />
    </>
  );
};
const root = createRoot(document.getElementById("app")!);
root.render(<App />);
