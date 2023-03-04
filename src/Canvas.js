import React, { useState, useRef, useEffect } from "react";
import {
  Stage,
  Layer,
  Line,
  Rect,
  Circle,
  Text,
  Image,
  Transformer,
  RegularPolygon,
  Wedge,
} from "react-konva";
import { circleColors, mockLineData } from "./utils";

const Canvas = () => {
  const [lines, setLines] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [tool, setTool] = useState("");
  const [undoHistory, setUndoHistory] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [currentLine, setCurrentLine] = useState([]);
  const stageRef = useRef(null);
  const shapeRef = useRef(null);

  useEffect(() => {
    const stage = stageRef.current.getStage();
    if (drawing) {
      stage.container().style.cursor = "crosshair";
    } else {
      stage.container().style.cursor = "default";
    }
  }, [drawing]);

  const getStyle = () => {
    switch (tool) {
      case "dashed":
        return {
          stroke: "black",
          strokeWidth: 2,
          dash: [10, 5],
          lineCap: "round",
        };
      case "dotted":
        return {
          stroke: "blue",
          strokeWidth: 2,
          dash: [2, 2],
          lineCap: "round",
        };
      default:
        return { stroke: "red", strokeWidth: 2, lineCap: "round" };
    }
  };

  const handleMouseDown = () => {
    if (tool) {
      setDrawing(true);
      setCurrentLine([]);
    }
  };

  const handleMouseMove = (e) => {
    if(tool){
      if (!drawing) {
        return;
      }
      const pos = e.target.getStage().getPointerPosition();
      setCurrentLine((line) => [...line, pos.x, pos.y]);
    }
  };

  const handleMouseUp = () => {
    if (tool) {
      setDrawing(false);
      setLines((lines) => [
        ...lines,
        { points: currentLine, style: { ...getStyle() } },
      ]);
      setCurrentLine([]);
    }
  };

  const handleAddShape = (shapeType, shapeColor = "white") => {
    switch (shapeType) {
      case "rectangle":
        setShapes([
          ...shapes,
          { type: "rectangle", x: 50, y: 50, width: 50, height: 50 },
        ]);
        setUndoHistory([...undoHistory, [...shapes]]);
        break;
      case "circle":
        setShapes([
          ...shapes,
          { type: "circle", x: 50, y: 50, radius: 25, fill: shapeColor },
        ]);
        setUndoHistory([...undoHistory, [...shapes]]);
        break;
      case "triangle":
        setShapes([...shapes, { type: "triangle", x: 50, y: 50, radius: 40 }]);
        setUndoHistory([...undoHistory, [...shapes]]);
        break;
      default:
        break;
    }
  };

  const handleShapeDragEnd = (e) => {
    const updatedShapes = [...shapes];
    updatedShapes[e.target.index].x = e.target.x();
    updatedShapes[e.target.index].y = e.target.y();
    setShapes(updatedShapes);
    setUndoHistory([...undoHistory, [...shapes]]);
  };

  const handleUndo = () => {
    let temp = [...shapes];
    temp.pop();
    setShapes(temp);
  };

  const handleSolidLine = () => {
    setTool("solid");
  };

  const handleDashedLine = () => {
    setTool("dashed");
  };

  const handleDottedLine = () => {
    setTool("dotted");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {circleColors.map((value, i) => (
          <div
            style={{
              borderRadius: "50%",
              backgroundColor: value,
              height: "50px",
              width: "50px",
            }}
            onClick={() => {
              handleAddShape("circle", value);
              setTool("");
            }}
          ></div>
        ))}
        <button
          onClick={() => {
            handleAddShape("rectangle", "white");
            setTool("");
          }}
        >
          Add Rectangle
        </button>
        <button onClick={() =>{ handleAddShape("triangle", "white")
            setTool("")
      }}>
          Add Triangle
        </button>
        <button onClick={handleSolidLine}>Solid Line</button>
        <button onClick={handleDashedLine}>Dashed Line</button>
        <button onClick={handleDottedLine}>Dotted Line</button>
        <button onClick={handleUndo}>Undo</button>
      </div>
      <Stage
        height={window.innerHeight}
        width={window.innerWidth}
        ref={stageRef}
        style={{
          border: "1px solid",
        }}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          {lines.map((line, i) => (
            <Line
              key={i}
              points={line.points}
              stroke={line.style.stroke}
              strokeWidth={line.style.strokeWidth}
              dash={line.style.dash}
              lineCap={line.style.lineCap}
            />
          ))}
          {currentLine.length > 0 && (
            <Line
              points={currentLine}
              stroke={getStyle().stroke}
              strokeWidth={getStyle().strokeWidth}
              dash={getStyle().dash}
              lineCap={getStyle().lineCap}
            />
          )}
          {shapes.map((shape, i) => {
            switch (shape.type) {
              case "rectangle":
                return (
                  <Rect
                    key={i}
                    x={shape.x}
                    y={shape.y}
                    width={shape.width}
                    height={shape.height}
                    fill="white"
                    stroke="black"
                    strokeWidth={1}
                    draggable={true}
                    ref={shapeRef}
                    onDragEnd={handleShapeDragEnd}
                    onClick={() => setTool("")}
                    style={{
                      cursor: "pointer"
                    }}
                  />
                );
              case "circle":
                return (
                  <Circle
                    key={i}
                    x={shape.x}
                    y={shape.y}
                    radius={shape.radius}
                    fill={shape.fill}
                    stroke="black"
                    strokeWidth={1}
                    draggable={true}
                    ref={shapeRef}
                    onDragEnd={handleShapeDragEnd}
                    onClick={() => setTool("")}
                  />
                );
              case "triangle":
                return (
                  <RegularPolygon
                    key={i}
                    x={shape.x}
                    y={shape.y}
                    sides={3}
                    fill="white"
                    stroke="black"
                    strokeWidth={1}
                    radius={35}
                    draggable={true}
                    ref={shapeRef}
                    onDragEnd={handleShapeDragEnd}
                    onClick={() => setTool("")}
                  />
                );

              default:
                return null;
            }
          })}
        </Layer>
      </Stage>
      <div></div>
    </div>
  );
};

export default Canvas;
