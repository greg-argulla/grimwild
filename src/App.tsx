import { useEffect, useState } from "react";
import styles from "./App.module.css";
import { CharacterSheet } from "./CharacterSheet";
import { PathList, Talent } from "./PathSheet";
import OBR, { Metadata } from "@owlbear-rodeo/sdk";
import { ChatBoard, PoolBoard } from "./ChatBoard";
import { CharacterList } from "./CharacterList";
import classNames from "classnames";

export type Bond = {
  id: number;
  name: string;
  intensity: string;
  nature: string;
};

export type Player = {
  id: number;
  name: string;
  path:
    | ""
    | "artificer"
    | "bard"
    | "berserker"
    | "cleric"
    | "druid"
    | "fighter"
    | "monk"
    | "paladin"
    | "psion"
    | "ranger"
    | "rogue"
    | "sorcerer"
    | "warlock"
    | "wizard";
  player: string;
  background1: string;
  background2: string;
  wise1: string;
  wise2: string;
  groupArc: string;
  characterArc: string;
  features: string;
  conditions: string;
  brawn: number;
  agility: number;
  wits: number;
  presence: number;

  brawnMark: boolean;
  agilityMark: boolean;
  witsMark: boolean;
  presenceMark: boolean;

  bloodied: boolean;
  rattled: boolean;

  story1: boolean;
  story2: boolean;

  spark1: boolean;
  spark2: boolean;

  experience: number;

  healingBloodied: number;
  healingRattled: number;

  droppedBloodied: boolean;
  droppedRattled: boolean;

  trait1: string;
  trait2: string;
  notTrait: string;
  desire1: string;
  desire2: string;
  notDesire: string;

  bonds: Bond[];
  talents: Talent[];
  coreTalent: Talent | null;
  bio: string;
};

export type Chat = {
  id: number;
  user: string;
  message: string;
  title?: string;
  description?: string;
  dice: number[];
  thorns: number[];
  initialOutcome: string;
  outcome: string;
  thornEffect: string[];
  gmRoll?: boolean;
};

export type Pool = {
  id: number;
  name: string;
  value: number;
};

export type GMData = {
  suspense: string;
};

export const setMetadata = (metadata: Metadata) => {
  const metadataWithDate = {
    ...metadata,
    "grimwild.date.extension/metadata": Date.now(),
  };
  OBR.scene.setMetadata(metadataWithDate);
};

function App() {
  const [isOBRReady, setIsOBRReady] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("PLAYER");
  const [chat, setChat] = useState<Chat[]>([]);
  const [chatToCheckChanges, setChatToCheckChanges] = useState<Chat[]>([]);
  const [myChat, setMyChat] = useState<Chat[]>([]);
  const [cookiesNotEnabled, setCookiesNotEnabled] = useState<boolean>(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [timeoutID, setTimeoutID] = useState<number | null>(null);
  const [gmData, setGMData] = useState<GMData>({ suspense: "0" });
  const [chatOnly, setChatOnly] = useState<boolean>(false);
  const [tab, setTab] = useState<
    "playerList" | "chat" | "character" | "path" | "pool"
  >("chat");
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [poolList, setPoolList] = useState<Pool[]>([]);

  useEffect(() => {
    setChatOnly(window.location.href.indexOf("/chatpopover") > 1);
  }, []);

  const createPlayerList = async (metadata: Metadata) => {
    const metadataGet = metadata[
      "grimwild.character.extension/metadata"
    ] as Record<string, any>;
    const playerListGet: Player[] = [];
    const keys = Object.keys(metadataGet);
    keys.forEach((key) => {
      playerListGet.push(metadataGet[key]);
    });
    return playerListGet;
  };

  const createPoolList = async (metadata: Metadata) => {
    const metadataGet = metadata["grimwild.pool.extension/metadata"] as Record<
      string,
      any
    >;
    const poolGet: Pool[] = [];
    const keys = Object.keys(metadataGet);
    keys.forEach((key) => {
      poolGet.push(metadataGet[key]);
    });
    return poolGet;
  };

  const createChatArray = async (metadata: Metadata) => {
    const metadataGet = metadata["grimwild.extension/metadata"] as Record<
      string,
      any
    >;
    let messages: Chat[] = [];

    const playerId = await OBR.player.getId();
    setId(playerId);

    if (metadataGet) {
      const keys = Object.keys(metadataGet);

      keys.forEach((key) => {
        messages = messages.concat(metadataGet[key]);
        if (key === playerId) {
          setMyChat(metadataGet[key]);
        }
      });
    }
    return messages.sort((a, b) => a.id - b.id);
  };

  const updatePlayer = (playerGet: Player) => {
    if (!timeoutID) {
      const myTimeout = setTimeout(() => {
        savePlayer(playerGet);
      }, 500);
      setTimeoutID(myTimeout);
    } else {
      clearTimeout(timeoutID);
      const myTimeout = setTimeout(() => {
        savePlayer(playerGet);
      }, 500);
      setTimeoutID(myTimeout);
    }
    setPlayer(playerGet);
  };

  const savePlayer = async (playerGet: Player) => {
    if (playerGet) {
      const metadataData = await OBR.scene.getMetadata();
      const metadata = metadataData[
        "grimwild.character.extension/metadata"
      ] as Record<string, any>;
      let metadataChange = { ...metadata };
      metadataChange[playerGet.id] = { ...playerGet, lastEdit: id };

      setMetadata({
        "grimwild.character.extension/metadata": metadataChange,
      });
      setTimeoutID(null);
    }
  };

  const saveLocal = async () => {
    const metadata = await OBR.scene.getMetadata();

    const metadataToStore = {
      room: OBR.room.id,
      dateNow: Date.now(),
      "grimwild.character.extension/metadata":
        metadata["grimwild.character.extension/metadata"],
      "grimwild.pool.extension/metadata":
        metadata["grimwild.pool.extension/metadata"],
      "grimwild.extension/metadata": metadata["grimwild.extension/metadata"],
    };

    localStorage.setItem(
      "grimwild.extension/metadata",
      JSON.stringify(metadataToStore)
    );
  };

  const loadLocal = async () => {
    const savedLocal = localStorage.getItem("grimwild.extension/metadata");
    const metadata = await OBR.scene.getMetadata();
    if (savedLocal) {
      const metadataStored = JSON.parse(savedLocal);
      const metadataLastUpdate =
        (metadata["grimwild.date.extension/metadata"] as number) ?? 0;
      if (
        metadataStored.room === OBR.room.id &&
        metadataLastUpdate < metadataStored.dateNow
      ) {
        await setMetadata({
          "grimwild.character.extension/metadata":
            metadataStored["grimwild.character.extension/metadata"],
          "grimwild.pool.extension/metadata":
            metadataStored["grimwild.pool.extension/metadata"],
          "grimwild.extension/metadata":
            metadataStored["grimwild.extension/metadata"],
        });
      }
    }
  };

  useEffect(() => {
    OBR.onReady(async () => {
      OBR.scene.onReadyChange(async (ready) => {
        if (ready) {
          if ((await OBR.player.getRole()) === "GM") {
            await loadLocal();
          }

          const metadata = await OBR.scene.getMetadata();

          if (metadata["grimwild.character.extension/metadata"]) {
            const playerListGet = await createPlayerList(metadata);
            setPlayerList(playerListGet);
          }

          if (metadata["grimwild.pool.extension/metadata"]) {
            const poolListGet = await createPoolList(metadata);
            setPoolList(poolListGet);
          }

          if (metadata["grimwild.extension/metadata"]) {
            const currentChat = await createChatArray(metadata);
            setChatToCheckChanges(currentChat);
          }

          if (metadata["grimwild.gm.extension/metadata"]) {
            const gmData = metadata["grimwild.gm.extension/metadata"] as GMData;
            setGMData(gmData);
          }

          setIsOBRReady(true);
          setTimeout(() => {
            var objDiv = document.getElementById("chatbox");
            if (objDiv) {
              objDiv.scrollTop = objDiv.scrollHeight;
            }
          }, 100);

          OBR.action.setBadgeBackgroundColor("orange");
          setName(await OBR.player.getName());
          setId(await OBR.player.getId());

          OBR.player.onChange(async () => {
            setName(await OBR.player.getName());
          });

          setRole(await OBR.player.getRole());
        } else {
          setIsOBRReady(false);
          setChat([]);
        }
      });

      if (await OBR.scene.isReady()) {
        if ((await OBR.player.getRole()) === "GM") {
          await loadLocal();
        }

        const metadata = await OBR.scene.getMetadata();

        if (metadata["grimwild.character.extension/metadata"]) {
          const playerListGet = await createPlayerList(metadata);
          setPlayerList(playerListGet);
        }

        if (metadata["grimwild.pool.extension/metadata"]) {
          const poolListGet = await createPoolList(metadata);
          setPoolList(poolListGet);
        }

        if (metadata["grimwild.extension/metadata"]) {
          const currentChat = await createChatArray(metadata);
          setChatToCheckChanges(currentChat);
        }

        if (metadata["grimwild.gm.extension/metadata"]) {
          const gmData = metadata["grimwild.gm.extension/metadata"] as GMData;
          setGMData(gmData);
        }

        setIsOBRReady(true);
        setTimeout(() => {
          var objDiv = document.getElementById("chatbox");
          if (objDiv) {
            objDiv.scrollTop = objDiv.scrollHeight;
          }
        }, 100);

        OBR.action.setBadgeBackgroundColor("orange");
        setName(await OBR.player.getName());
        setId(await OBR.player.getId());

        OBR.player.onChange(async () => {
          setName(await OBR.player.getName());
        });

        setRole(await OBR.player.getRole());
      }
    });

    try {
      localStorage.getItem("grimwild.extension/rolldata");
    } catch {
      setCookiesNotEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (chatToCheckChanges.length !== chat.length) {
      setChat(chatToCheckChanges);
      setTimeout(() => {
        var objDiv = document.getElementById("chatbox");
        if (objDiv) {
          objDiv.scrollTop = objDiv.scrollHeight;
        }
      }, 100);
    }
  }, [chatToCheckChanges]);

  useEffect(() => {
    if (isOBRReady) {
      OBR.scene.onMetadataChange(async (metadata) => {
        const currentChat = await createChatArray(metadata);
        setChatToCheckChanges(currentChat);

        const playerListGet = await createPlayerList(metadata);
        setPlayerList(playerListGet);

        const poolListGet = await createPoolList(metadata);
        setPoolList(poolListGet);

        const gmData = metadata["grimwild.gm.extension/metadata"] as GMData;
        setGMData(gmData);

        if ((await OBR.player.getRole()) === "GM") {
          saveLocal();
        }
      });

      OBR.action.onOpenChange(async (isOpen) => {
        // React to the action opening or closing
        if (isOpen && tab === "chat" && player) {
          setUnreadCount(0);
        }
      });

      try {
        localStorage.getItem("grimwild.extension/rolldata");
      } catch {
        setCookiesNotEnabled(true);
        return;
      }
    }
  }, [isOBRReady]);

  useEffect(() => {
    if (unreadCount > 0) {
      OBR.action.setBadgeText("" + unreadCount);
    } else OBR.action.setBadgeText(undefined);
  }, [unreadCount, isOBRReady]);

  useEffect(() => {
    const updateMessages = async () => {
      const lastMessage = chat[chat.length - 1];

      if (lastMessage && isOBRReady) {
        if (isOBRReady) {
          const isOpen = await OBR.action.isOpen();
          if (!isOpen || tab !== "chat") {
            setUnreadCount(unreadCount + 1);
          }
        }
      }
    };

    if (isOBRReady) {
      updateMessages();
    }
  }, [chat]);

  if (cookiesNotEnabled) {
    return "Cookies not enabled";
  }

  if (!isOBRReady) {
    return (
      <div className={styles.global}>
        <div className={classNames(styles.Sheet, styles.scrollable)}>
          <div className={styles.header}>No Scene found.</div>
          <div>
            You need to load a scene to start adding/updating characters. If a
            scene is already loaded, kindly refresh the page.
          </div>
        </div>
      </div>
    );
  }

  if (chatOnly) {
    return (
      <div className={styles.global}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0.5rem",
          }}
        >
          <div className={styles.header}>Chat</div>
          <button
            className={styles.chatCloseButton}
            onClick={() => {
              OBR.popover.close("chat/popover");
            }}
          >
            Close
          </button>
        </div>

        <ChatBoard
          chat={chat}
          role={role}
          myChat={myChat}
          id={id}
          pools={poolList}
          player={player ? player.name : name}
          gmData={gmData}
          players={playerList}
          chatOnly={chatOnly}
        />
      </div>
    );
  }

  const openChatOnly = async () => {
    await OBR.popover.open({
      id: "chat/popover",
      url: "/chatpopover",
      height: 600,
      width: 300,
      anchorOrigin: { horizontal: "RIGHT", vertical: "BOTTOM" },
      hidePaper: true,
      marginThreshold: 0,
      disableClickAway: true,
    });
  };

  return (
    <div className={styles.global}>
      {player && (
        <div className={classNames(styles.fixedMenu)}>
          <button
            className={classNames(styles.menuButton, {
              [styles.menuButtonSelected]: tab === "character",
            })}
            onClick={() => {
              setTab("character");
            }}
          >
            Character
          </button>
          <button
            className={classNames(styles.menuButton, {
              [styles.menuButtonSelected]: tab === "path",
            })}
            onClick={() => {
              setTab("path");
            }}
          >
            Path
          </button>
          <button
            className={classNames(styles.menuButton, {
              [styles.menuButtonSelected]: tab === "pool",
            })}
            onClick={() => {
              setTab("pool");
              setTimeout(() => {
                var objDiv = document.getElementById("chatbox");
                if (objDiv) {
                  objDiv.scrollTop = objDiv.scrollHeight;
                }
              }, 1);
            }}
          >
            Pools
          </button>
          <button
            className={classNames(styles.menuButton, {
              [styles.menuButtonSelected]: tab === "chat",
            })}
            onClick={() => {
              setTab("chat");
              setUnreadCount(0);
              setTimeout(() => {
                var objDiv = document.getElementById("chatbox");
                if (objDiv) {
                  objDiv.scrollTop = objDiv.scrollHeight;
                }
              }, 1);
            }}
          >
            Chat {unreadCount ? `(${unreadCount})` : ""}
          </button>
          <button
            className={classNames(styles.menuButton)}
            style={{ marginLeft: "auto", width: "3rem" }}
            onClick={() => {
              setPlayer(null);
            }}
          >
            Close
          </button>
        </div>
      )}

      {tab === "character" && player && (
        <CharacterSheet
          player={player}
          updatePlayer={updatePlayer}
          myChat={myChat}
          id={id}
          onRoll={() => {
            setTab("chat");
          }}
        />
      )}

      {tab === "path" && player && (
        <PathList
          player={player}
          updatePlayer={updatePlayer}
          myChat={myChat}
          id={id}
        />
      )}

      {!player && (
        <CharacterList
          playerList={playerList}
          onOpen={(player: Player) => {
            setTab("character");
            setPlayer(player);
          }}
        />
      )}

      {tab === "pool" && player && (
        <PoolBoard
          chat={chat}
          role={role}
          myChat={myChat}
          id={id}
          pools={poolList}
          player={player.name}
          gmData={gmData}
          players={playerList}
          chatOnly={chatOnly}
        />
      )}

      {tab === "chat" && player && (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              paddingTop: "0.5rem",
              paddingLeft: "1.5rem",
              paddingRight: "1.5rem",
            }}
          >
            <div className={styles.header}>Chat</div>
            <button
              className={styles.chatCloseButton}
              onClick={() => {
                openChatOnly();
              }}
            >
              Popover
            </button>
          </div>
          <ChatBoard
            chat={chat}
            role={role}
            myChat={myChat}
            id={id}
            pools={poolList}
            player={player.name}
            gmData={gmData}
            players={playerList}
            chatOnly={chatOnly}
          />
        </>
      )}
    </div>
  );
}

export default App;
