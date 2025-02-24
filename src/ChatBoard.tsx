import { useState } from "react";

import type { Chat, Player, Pool } from "./App";
import OBR from "@owlbear-rodeo/sdk";

import style from "./App.module.css";

import d61 from "./assets/dice/d61.png";
import d62 from "./assets/dice/d62.png";
import d63 from "./assets/dice/d63.png";
import d64 from "./assets/dice/d64.png";
import d65 from "./assets/dice/d65.png";
import d66 from "./assets/dice/d66.png";
import d81 from "./assets/dice/d81.png";
import d82 from "./assets/dice/d82.png";
import d83 from "./assets/dice/d83.png";
import d84 from "./assets/dice/d84.png";
import d85 from "./assets/dice/d85.png";
import d86 from "./assets/dice/d86.png";
import d87 from "./assets/dice/d87.png";
import d88 from "./assets/dice/d88.png";
import classNames from "classnames";

type Props = {
  chat: Chat[];
  role: string;
  myChat: Chat[];
  id: string; // Player Id
  pools: Pool[];
  player: Player;
};

const diceImg = [d61, d62, d63, d64, d65, d66];
const thornImg = [d81, d82, d83, d84, d85, d86, d87, d88];

const getRollColor = (outcome: string) => {
  let color = "black";
  switch (outcome) {
    case "Critical":
      color = "purple";
      break;
    case "Perfect":
      color = "green";
      break;
    case "Messy":
      color = "darkgoldenrod";
      break;
    case "Grim":
      color = "darkred";
      break;
    case "Disaster":
      color = "red"; //Disaster text change
      break;
    default:
      color = "black"; //Or your preferred "normal" color
      break;
  }
  return color;
};

const generateRandomNumber = (end: number) => {
  var range = end;
  var randomNum = Math.floor(Math.random() * range) + 1;

  return randomNum;
};

export const addRoll = async (
  diceCount: number,
  thornCount: number,
  myChat: Chat[],
  id: string, //playerId
  player: Player,
  odds?: string
) => {
  const dice = [];
  const thorns = [];

  let perfect = 0;
  let messy = 0;
  let thorn = 0;

  for (let i = 0; i < diceCount; i++) {
    const value = generateRandomNumber(6);
    dice.push(value);
    if (value === 6) {
      perfect++;
    } else if (value > 3) {
      messy++;
    }
  }

  for (let i = 0; i < thornCount; i++) {
    const value = generateRandomNumber(8);
    thorns.push(value);
    if (value > 6) {
      thorn++;
    }
  }

  let outcome = "Grim"; // Default
  if (perfect > 1) {
    outcome = "Critical"; // Set to "Crit" if two 6's are rolled
  } else if (perfect > 0) {
    outcome = "Perfect";
  } else if (messy > 0) {
    outcome = "Messy";
  }

  let thornEffect = []; //String to store what happened.
  let initialOutcome = outcome; // to show the base number

  for (let i = 0; i < thorn; i++) {
    if (outcome === "Messy") {
      outcome = "Grim";
      thornEffect.push("(Messy -> Grim)");
    } else if (outcome === "Perfect") {
      outcome = "Messy"; //Or Grim you can choose.
      thornEffect.push("\n(Perfect -> Messy)");
    } else if (outcome === "Grim") {
      outcome = "Disaster";
      thornEffect.push("(Grim -> Disaster)");
    }
  }

  if (odds) {
    thornEffect.push(odds);
  }

  if (dice.length === 0 && thorns.length === 0) return;

  const newMessage = {
    id: Date.now(),
    user: player.name,
    dice,
    thorns,
    initialOutcome,
    outcome,
    thornEffect,
  };

  const newChat = [...myChat, newMessage];

  const metadataGet = await OBR.scene.getMetadata();
  const metadata = metadataGet["grimwild.extension/metadata"] as Record<
    string,
    any
  >;
  let metadataChange = { ...metadata };
  metadataChange[id] = newChat;

  OBR.scene.setMetadata({
    "grimwild.extension/metadata": metadataChange,
  });
  // setTab("chat");
  // setUnreadCount(0);

  setTimeout(() => {
    var objDiv = document.getElementById("chatbox");
    if (objDiv) {
      objDiv.scrollTop = objDiv.scrollHeight;
    }
  }, 100);
};

const RollInstance = ({ chat, name }: { chat: Chat; name: string }) => {
  if (chat.dice.length || (chat.thorns && chat.thorns.length)) {
    return (
      <div style={{ textAlign: chat.user === name ? "right" : "left" }}>
        <div className={style.chatSender}>{chat.user}</div>
        <div
          className={style.rollResult}
          style={{ flexDirection: chat.user === name ? "row-reverse" : "row" }}
        >
          {chat.dice.map((value, index) => {
            return (
              <img
                src={diceImg[value - 1]}
                width={24}
                height={24}
                key={"dice" + index}
              />
            );
          })}

          {chat.thorns &&
            chat.thorns.map((value, index) => {
              return (
                <img
                  src={thornImg[value - 1]}
                  width={30}
                  height={30}
                  key={"thorn" + index}
                />
              );
            })}
        </div>

        {chat.dice.length > 0 && (
          <>
            <div style={{ fontSize: 16 }}>
              {chat.thornEffect.map((value, index) => {
                return <div key={index}>{value}</div>;
              })}
            </div>
            <div
              className={style.header}
              style={{ color: getRollColor(chat.outcome), fontSize: 14 }}
            >
              {chat.outcome}
            </div>
          </>
        )}
      </div>
    );
  }
};

const ChatInstance = ({ chat, name }: { chat: Chat; name: string }) => {
  if (chat.message) {
    return (
      <div style={{ textAlign: chat.user === name ? "right" : "left" }}>
        <div className={style.chatSender}>{chat.user}</div>
        <span>{chat.message}</span>
      </div>
    );
  }
  return <RollInstance chat={chat} name={name}></RollInstance>;
};

export const PoolInstance = ({
  pool,
  onChange,
  onRemove,
  onRoll,
}: {
  pool: Pool;
  onChange: (pool: Pool) => void;
  onRemove: () => void;
  onRoll: () => void;
}) => {
  return (
    <div className={classNames(style.fieldContainer)}>
      <div className={style.fieldRowNoSpread}>
        <input
          className={style.fieldStatSmall}
          value={pool.value}
          onChange={(e) => {
            const val = e.target.value;
            const num = parseInt(val.charAt(val.length - 1));
            onChange({ ...pool, value: !isNaN(num) ? num : 0 });
          }}
        ></input>
        <button
          onClick={() => {
            onRoll();
          }}
        >
          Roll
        </button>
        <input
          className={style.poolField}
          type="text"
          value={pool.name}
          onChange={(e) => {
            onChange({ ...pool, name: e.target.value });
          }}
        ></input>
        <button
          className={style.statButton}
          style={{ width: "0.75rem", height: "0.75rem" }}
          onClick={() => {
            onRemove();
          }}
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const ChatBoard = ({ chat, myChat, role, id, pools, player }: Props) => {
  const [text, setText] = useState<string>("");
  const [diceCount, setDiceCount] = useState<number | null>(0);
  const [thornsCount, setThornCount] = useState<number | null>(0);
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      addMessage();
    }
  };

  const addMessage = async () => {
    if (text !== "") {
      if (role === "GM") {
        if (text === "/clearchat") {
          clearChat();
          setText("");
          return;
        }
      }

      const newMessage = {
        id: Date.now(),
        user: player.name,
        message: text.trim(),
      };
      const newChat = [...myChat, newMessage];

      const metadataGet = await OBR.scene.getMetadata();
      const metadata = metadataGet["grimwild.extension/metadata"] as Record<
        string,
        any
      >;

      let metadataChange = { ...metadata };
      metadataChange[id] = newChat;

      OBR.scene.setMetadata({
        "grimwild.extension/metadata": metadataChange,
      });

      setText("");

      setTimeout(() => {
        var objDiv = document.getElementById("chatbox");
        if (objDiv) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      }, 100);
    }
  };

  const addPool = async (value?: number) => {
    const poolGet: Pool = { id: Date.now(), name: "", value: value || 0 };
    const metadataData = await OBR.scene.getMetadata();
    const metadata = metadataData["grimwild.pool.extension/metadata"] as Record<
      string,
      any
    >;
    let metadataChange = { ...metadata };
    metadataChange[poolGet.id] = poolGet;

    OBR.scene.setMetadata({
      "grimwild.pool.extension/metadata": metadataChange,
    });
  };

  const removePool = async (id: number) => {
    const metadataData = await OBR.scene.getMetadata();
    const metadata = metadataData["grimwild.pool.extension/metadata"] as Record<
      string,
      any
    >;
    let metadataChange = { ...metadata };

    delete metadataChange[id];

    OBR.scene.setMetadata({
      "grimwild.pool.extension/metadata": metadataChange,
    });
  };

  const updatePool = async (pool: Pool) => {
    if (pool) {
      const metadataData = await OBR.scene.getMetadata();
      const metadata = metadataData[
        "grimwild.pool.extension/metadata"
      ] as Record<string, any>;
      let metadataChange = { ...metadata };
      metadataChange[pool.id] = { ...pool, lastEdit: id };

      OBR.scene.setMetadata({
        "grimwild.pool.extension/metadata": metadataChange,
      });
    }
  };

  const poolRoll = async (diceCount: number) => {
    let toDrop = 0;
    let dice = [];

    for (let i = 0; i < diceCount; i++) {
      const value = generateRandomNumber(6);
      dice.push(value);
      if (value < 4) {
        toDrop++;
      }
    }

    const newValue = diceCount - toDrop;

    if (dice.length === 0) return;

    const newMessage = {
      id: Date.now(),
      user: player.name,
      dice,
      thornEffect: [],
      outcome: `${diceCount} ➜ ${newValue}`,
    };

    const newChat = [...myChat, newMessage];

    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["grimwild.extension/metadata"] as Record<
      string,
      any
    >;
    let metadataChange = { ...metadata };
    metadataChange[id] = newChat;

    OBR.scene.setMetadata({
      "grimwild.extension/metadata": metadataChange,
    });

    setTimeout(() => {
      var objDiv = document.getElementById("chatbox");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }, 100);
  };

  const rollPool = async (pool: Pool) => {
    let toDrop = 0;
    let dice = [];

    for (let i = 0; i < pool.value; i++) {
      const value = generateRandomNumber(6);
      dice.push(value);
      if (value < 4) {
        toDrop++;
      }
    }

    const newValue = pool.value - toDrop;

    const thornEffect = [pool.name];

    const newMessage = {
      id: Date.now(),
      user: player.name,
      dice,
      thornEffect,
      outcome: `${pool.value} ➜ ${newValue}`,
    };

    updatePool({ ...pool, value: newValue });

    const newChat = [...myChat, newMessage];

    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["grimwild.extension/metadata"] as Record<
      string,
      any
    >;
    let metadataChange = { ...metadata };
    metadataChange[id] = newChat;

    OBR.scene.setMetadata({
      "grimwild.extension/metadata": metadataChange,
    });

    setTimeout(() => {
      var objDiv = document.getElementById("chatbox");
      if (objDiv) {
        objDiv.scrollTop = objDiv.scrollHeight;
      }
    }, 100);
  };

  const clearChat = async () => {
    const metadataGet = await OBR.scene.getMetadata();
    const metadata = metadataGet["grimwild.extension/metadata"] as Record<
      string,
      any
    >;
    const keys = Object.keys(metadata);

    let clearedMetaData = { ...metadata };

    keys.forEach((key) => {
      clearedMetaData[key] = [];
    });

    OBR.scene.setMetadata({
      "grimwild.extension/metadata": clearedMetaData,
    });
  };

  return (
    <div className={classNames(style.Sheet)}>
      <div className={style.fieldRow}>
        <div className={classNames(style.fieldColumn)}>
          <div className={style.header}>Rolls</div>
          <div className={classNames(style.fieldColumn)}>
            <div
              className={classNames(style.fieldRow)}
              style={{ alignItems: "center" }}
            >
              <div
                className={style.fieldContainer}
                style={{
                  alignItems: "flex-end",
                  flexGrow: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <div className={style.fieldStatContainerSmall}>
                  <b>Dice</b>
                  <input
                    className={style.fieldStat}
                    type="number"
                    value={diceCount === null ? "" : diceCount}
                    onClick={() => {
                      setDiceCount(null);
                    }}
                    onBlur={() => {
                      if (diceCount === null) {
                        setDiceCount(0);
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseInt(val.charAt(val.length - 1));
                      setDiceCount(!isNaN(num) ? num : null);
                    }}
                  ></input>
                </div>
                <div className={style.fieldStatContainerSmall}>
                  <b>Thorns</b>
                  <input
                    className={style.fieldStat}
                    type="number"
                    value={thornsCount === null ? "" : thornsCount}
                    onClick={() => {
                      setThornCount(null);
                    }}
                    onBlur={() => {
                      if (thornsCount === null) {
                        setThornCount(0);
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      const num = parseInt(val.charAt(val.length - 1));
                      setThornCount(!isNaN(num) ? num : null);
                    }}
                  ></input>
                </div>
                <div className={style.fieldStatContainerSmall}>
                  <button
                    onClick={() => {
                      poolRoll(diceCount ?? 0);
                    }}
                    style={{ width: "4rem" }}
                  >
                    Pool
                  </button>
                  <button
                    onClick={() => {
                      addRoll(
                        diceCount ?? 0,
                        thornsCount ?? 0,
                        myChat,
                        id,
                        player
                      );
                    }}
                    style={{ width: "4rem" }}
                  >
                    Roll
                  </button>
                </div>
              </div>
              <div
                className={style.statContainer}
                style={{ alignItems: "center" }}
              >
                <div className={style.fieldStatContainerSmall}>
                  <button
                    className={style.storyButton}
                    onClick={() => {
                      addRoll(3, 0, myChat, id, player, "Good Odds");
                    }}
                  >
                    Good
                  </button>
                  <button
                    className={style.storyButton}
                    onClick={() => {
                      addRoll(2, 0, myChat, id, player, "Even Odds");
                    }}
                  >
                    Even
                  </button>
                  <button
                    className={style.storyButton}
                    onClick={() => {
                      addRoll(1, 0, myChat, id, player, "Bad Odds");
                    }}
                  >
                    Bad
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className={style.header}>Pools</div>
          <div className={style.poolContainer}>
            {pools.map((pool) => {
              return (
                <PoolInstance
                  key={pool.id}
                  pool={pool}
                  onChange={(pool) => {
                    updatePool(pool);
                  }}
                  onRoll={() => {
                    rollPool(pool);
                  }}
                  onRemove={() => {
                    removePool(pool.id);
                  }}
                />
              );
            })}
          </div>
          <div className={style.poolButtons}>
            <b>Add Pool:</b>
            <button
              className={style.statButton}
              onClick={() => {
                addPool(4);
              }}
            >
              Short
            </button>
            <button
              className={style.statButton}
              onClick={() => {
                addPool(6);
              }}
            >
              Mid
            </button>
            <button
              className={style.statButton}
              onClick={() => {
                addPool(8);
              }}
            >
              Long
            </button>
          </div>
        </div>
        <div className={style.chatBox}>
          <div id="chatbox" className={classNames(style.chatScrollable)}>
            {chat.length
              ? chat
                  .sort((a, b) => a.id - b.id)
                  .map((chat) => (
                    <ChatInstance
                      chat={chat}
                      key={chat.id}
                      name={player.name}
                    />
                  ))
              : ""}
          </div>
          <input
            id="chatbox"
            className={style.chatField}
            value={text}
            onChange={(evt) => {
              setText(evt.target.value);
            }}
            onKeyDown={(e) => {
              handleKeyDown(e);
            }}
          ></input>
        </div>
      </div>
    </div>
  );
};
