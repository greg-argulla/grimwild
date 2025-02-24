import { useEffect, useState } from "react";
import styles from "./App.module.css";
import { CharacterSheet } from "./CharacterSheet";
import { PathList, Talent } from "./PathSheet";
import OBR, { Metadata } from "@owlbear-rodeo/sdk";
import { ChatBoard } from "./ChatBoard";
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
};

export type Pool = {
  id: number;
  name: string;
  value: number;
};

function App() {
  const [isOBRReady, setIsOBRReady] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [_, setName] = useState<string>("");
  const [id, setId] = useState<string>("");
  const [role, setRole] = useState<string>("PLAYER");
  const [chat, setChat] = useState<Chat[]>([]);
  const [chatToCheckChanges, setChatToCheckChanges] = useState<Chat[]>([]);
  const [myChat, setMyChat] = useState<Chat[]>([]);
  const [cookiesNotEnabled, setCookiesNotEnabled] = useState<boolean>(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [timeoutID, setTimeoutID] = useState<number | null>(null);
  const [tab, setTab] = useState<"playerList" | "chat" | "character" | "path">(
    "chat"
  );
  const [playerList, setPlayerList] = useState<Player[]>([]);
  const [poolList, setPoolList] = useState<Pool[]>([]);

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

      OBR.scene.setMetadata({
        "grimwild.character.extension/metadata": metadataChange,
      });
      setTimeoutID(null);
    }
  };

  useEffect(() => {
    OBR.onReady(async () => {
      OBR.scene.onReadyChange(async (ready) => {
        if (ready) {
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
              [styles.menuButtonSelected]: tab === "chat",
            })}
            onClick={() => {
              setTab("chat");
              setUnreadCount(0);
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

      {tab === "chat" && player && (
        <ChatBoard
          chat={chat}
          role={role}
          myChat={myChat}
          id={id}
          pools={poolList}
          player={player}
        />
      )}
    </div>
  );
}

export default App;
