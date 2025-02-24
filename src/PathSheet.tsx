import classNames from "classnames";
import style from "./App.module.css";

import line from "./assets/line.webp";
import line2 from "./assets/line2.webp";
import artificerLogo from "./assets/classes/artificer.webp";
import bardLogo from "./assets/classes/bard.webp";
import berserkerLogo from "./assets/classes/berserker.webp";
import clericLogo from "./assets/classes/cleric.webp";
import druidLogo from "./assets/classes/druid.webp";
import fighterLogo from "./assets/classes/fighter.webp";
import monkLogo from "./assets/classes/monk.webp";
import paladinLogo from "./assets/classes/paladin.webp";
import psionLogo from "./assets/classes/psion.webp";
import rangerLogo from "./assets/classes/ranger.webp";
import rogueLogo from "./assets/classes/rogue.webp";
import sorcererLogo from "./assets/classes/sorcerer.webp";
import warlockLogo from "./assets/classes/warlock.webp";
import wizardLogo from "./assets/classes/wizard.webp";

export const logoMapping: Record<string, string> = {
  artificer: artificerLogo,
  bard: bardLogo,
  berserker: berserkerLogo,
  cleric: clericLogo,
  druid: druidLogo,
  fighter: fighterLogo,
  monk: monkLogo,
  paladin: paladinLogo,
  psion: psionLogo,
  ranger: rangerLogo,
  rogue: rogueLogo,
  sorcerer: sorcererLogo,
  warlock: warlockLogo,
  wizard: wizardLogo,
};

import artificerData from "./classes/artificer.json";
import bardData from "./classes/bard.json";
import berserkerData from "./classes/berserker.json";
import clericData from "./classes/cleric.json";
import druidData from "./classes/druid.json";
import fighterData from "./classes/fighter.json";
import monkData from "./classes/monk.json";
import paladinData from "./classes/paladin.json";
import psionData from "./classes/psion.json";
import rangerData from "./classes/ranger.json";
import rogueData from "./classes/rogue.json";
import sorcererData from "./classes/sorcerer.json";
import warlockData from "./classes/warlock.json";
import wizardData from "./classes/wizard.json";
import { Chat, Player } from "./App";
import { useState } from "react";
import OBR from "@owlbear-rodeo/sdk";

const dataMapping = {
  artificer: artificerData,
  bard: bardData,
  berserker: berserkerData,
  cleric: clericData,
  druid: druidData,
  fighter: fighterData,
  monk: monkData,
  paladin: paladinData,
  psion: psionData,
  ranger: rangerData,
  rogue: rogueData,
  sorcerer: sorcererData,
  warlock: warlockData,
  wizard: wizardData,
};

export type Tracker = {
  name: string;
  type: string;
  value1?: string;
  value2?: string;
  checked?: boolean;
};

export type Talent = {
  name: string;
  description: string;
  trackers?: Tracker[] | undefined;
};

const Talent = ({
  talent,
  onSelect,
  onRemove,
  onChangeTracker,
  onBroadcast,
}: {
  talent: Talent;
  onSelect?: () => void;
  onRemove?: () => void;
  onChangeTracker: (tracker: Tracker, index: number) => void;
  onBroadcast: () => void;
}) => {
  return (
    <div className={classNames(style.fieldColumn, style.statContainer)}>
      <div
        className={style.fieldRowNoSpread}
        style={{
          alignItems: "center",
          minHeight: "2rem",
        }}
      >
        <div className={style.header}>{talent.name}</div>

        {onRemove && (
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={() => {
                onRemove();
              }}
            >
              ×
            </button>
          </div>
        )}
      </div>

      {talent.trackers
        ?.filter((tracker) => tracker.type === "fieldSmallLong")
        .map((tracker, index) => (
          <div
            className={classNames(
              style.fieldStatContainerSmallRow,
              style.statDetail
            )}
            key={tracker.name + index}
          >
            <div
              className={style.fieldStatLabel}
              style={{ marginLeft: "0.25rem" }}
            >
              {tracker.name}
            </div>
            <div className={style.fieldRowNoSpread} style={{ gap: "0.25rem" }}>
              <input
                className={style.fieldSmallLong}
                value={tracker.value1}
                onChange={(e) => {
                  onChangeTracker(
                    {
                      ...tracker,
                      value1: e.target.value,
                    },
                    index
                  );
                }}
              ></input>
            </div>
          </div>
        ))}

      <img src={line2} />
      <div dangerouslySetInnerHTML={{ __html: talent.description }} />
      <img src={line2} />
      <div>
        <div className={style.statDetail}>
          <div className={style.fieldRowNoSpread} style={{ gap: 0 }}>
            {talent.trackers
              ?.filter((tracker) => tracker.type !== "fieldSmallLong")
              .map((tracker, index) => (
                <div
                  className={style.fieldStatContainerSmallRow}
                  key={tracker.name + index}
                >
                  <div
                    className={style.fieldStatLabel}
                    style={{ marginLeft: "0.25rem" }}
                  >
                    {tracker.name}
                  </div>

                  <div
                    className={style.fieldRowNoSpread}
                    style={{ gap: "0.25rem" }}
                  >
                    {tracker.type === "checkbox" && (
                      <input
                        type="checkbox"
                        checked={tracker.checked}
                        onChange={() => {
                          onChangeTracker(
                            {
                              ...tracker,
                              checked: !tracker.checked,
                            },
                            index
                          );
                        }}
                      />
                    )}
                    {tracker.type === "field" && (
                      <input
                        className={style.fieldStat}
                        value={tracker.value1}
                        onChange={(e) => {
                          onChangeTracker(
                            {
                              ...tracker,
                              value1: e.target.value,
                            },
                            index
                          );
                        }}
                      ></input>
                    )}
                    {tracker.type === "fieldSmall" && (
                      <input
                        className={style.fieldSmall}
                        value={tracker.value1}
                        onChange={(e) => {
                          onChangeTracker(
                            {
                              ...tracker,
                              value1: e.target.value,
                            },
                            index
                          );
                        }}
                      ></input>
                    )}
                    {tracker.type === "fieldTwo" && (
                      <>
                        <input
                          className={style.fieldStatSmall}
                          value={tracker.value1}
                          onChange={(e) => {
                            onChangeTracker(
                              {
                                ...tracker,
                                value1: e.target.value,
                              },
                              index
                            );
                          }}
                        ></input>
                        <input
                          className={style.fieldSmall}
                          value={tracker.value2}
                          onChange={(e) => {
                            onChangeTracker(
                              {
                                ...tracker,
                                value2: e.target.value,
                              },
                              index
                            );
                          }}
                          style={{ width: "4rem" }}
                        ></input>
                      </>
                    )}
                  </div>
                </div>
              ))}

            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={() => {
                  onBroadcast();
                }}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
      {onSelect && (
        <>
          <img src={line2} />
          <button
            onClick={() => {
              onSelect();
            }}
          >
            Add Talent
          </button>
        </>
      )}
    </div>
  );
};

export const PathSheet = ({
  player,
  updatePlayer,
  broadcast,
}: {
  player: Player;
  updatePlayer: (player: Player) => void;
  broadcast: (talent: Talent) => void;
}) => {
  if (player.path === "") return "";
  const data = dataMapping[player.path];

  return (
    <>
      <div className={style.fieldRowNoSpread}>
        <div>
          <img src={logoMapping[data.name.toLowerCase()]} width={80}></img>
        </div>
        <div className={style.fieldColumn}>
          <div
            className={style.fieldRowNoSpread}
            style={{ alignItems: "center" }}
          >
            <div className={style.header}>{data.name}</div>
            <div className={style.statDetail}>{data.description}</div>
          </div>
          <div className={style.statDetail} style={{ fontStyle: "italic" }}>
            {data.quote}
          </div>
        </div>
      </div>
      <img src={line} />
      <div className={style.header}>CORE TALENT</div>
      <Talent
        talent={player.coreTalent ?? data.coreTalent}
        onChangeTracker={(tracker, index) => {
          const coreTalent = player.coreTalent;
          if (coreTalent && coreTalent.trackers) {
            coreTalent.trackers[index] = tracker;
            updatePlayer({ ...player, coreTalent: coreTalent });
          }
        }}
        onBroadcast={() => {
          broadcast(data.coreTalent);
        }}
      />
      <img src={line2} />
      <div className={style.header}>DETAILS</div>
      {data.details.map((detail) => {
        return (
          <Talent
            talent={detail}
            key={detail.name}
            onChangeTracker={() => {}}
            onBroadcast={() => {
              broadcast(detail);
            }}
          />
        );
      })}
      <img src={line2} />
      {data.other !== null ? (
        <div className={classNames(style.fieldColumn, style.statContainer)}>
          <div dangerouslySetInnerHTML={{ __html: data.other }} />
        </div>
      ) : (
        ""
      )}
    </>
  );
};

const PathSelector = ({
  player,
  updatePlayer,
  onSelect,
}: {
  player: Player;
  updatePlayer?: (player: Player) => void;
  onSelect?: (path: string) => void;
}) => {
  const logoKeys = Object.keys(logoMapping) as Player["path"][];
  return (
    <div className={style.pathList}>
      {logoKeys.map((key) => {
        return (
          <div
            key={key}
            className={style.pathItem}
            onClick={() => {
              if (updatePlayer) {
                const data = key !== "" ? dataMapping[key].coreTalent : null;
                updatePlayer({
                  ...player,
                  path: key as Player["path"],
                  coreTalent: data,
                });
              }
              if (onSelect) {
                onSelect(key);
              }
            }}
          >
            <img src={logoMapping[key]} width={80}></img>
            <div className={style.header}>{key}</div>
          </div>
        );
      })}
    </div>
  );
};

const TalentList = ({
  path,
  player,
  updatePlayer,
  onClose,
  broadcast,
}: {
  player: Player;
  path: Player["path"];
  updatePlayer: (player: Player) => void;
  onClose: () => void;
  broadcast: (talent: Talent) => void;
}) => {
  if (path === "") return "";
  const data = dataMapping[path];

  return (
    <>
      <div className={style.fieldRowNoSpread}>
        <div className={style.header}>SELECT TALENT FROM {data.name}</div>
        <div style={{ marginLeft: "auto" }}>
          <button
            onClick={() => {
              onClose();
            }}
          >
            ×
          </button>
        </div>
      </div>

      <img src={line2} />
      {data.pathTalent.map((talent) => {
        return (
          <Talent
            talent={talent}
            key={talent.name}
            onSelect={() => {
              const talents = player.talents;
              updatePlayer({ ...player, talents: [...talents, talent] });
              onClose();
            }}
            onChangeTracker={() => {}}
            onBroadcast={() => {
              broadcast(talent);
            }}
          />
        );
      })}
    </>
  );
};

export const PathList = ({
  player,
  updatePlayer,
  myChat,
  id,
}: {
  player: Player;
  updatePlayer: (player: Player) => void;
  myChat: Chat[];
  id: string;
}) => {
  const [openPath, setOpenPath] = useState(false);
  const [selectedPath, setSelectedPath] = useState("");

  const broadcast = async (talent: Talent) => {
    const newMessage = {
      id: Date.now(),
      user: talent.name,
      description: talent.description,
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

  if (openPath && selectedPath === "") {
    return (
      <div className={classNames(style.Sheet, style.scrollable)}>
        <div className={style.fieldRowNoSpread}>
          <div className={style.header}>SELECT PATH TO CHOOSE TALENT</div>
          <div style={{ marginLeft: "auto" }}>
            <button
              onClick={() => {
                setOpenPath(false);
                setSelectedPath("");
              }}
            >
              ×
            </button>
          </div>
        </div>
        <img src={line} />
        <PathSelector
          player={player}
          onSelect={(key) => {
            setSelectedPath(key);
          }}
        />
      </div>
    );
  }

  if (selectedPath !== "") {
    return (
      <div
        className={classNames(style.Sheet, style.scrollable, style.fieldColumn)}
      >
        <TalentList
          path={selectedPath as Player["path"]}
          updatePlayer={updatePlayer}
          onClose={() => {
            setOpenPath(false);
            setSelectedPath("");
          }}
          player={player}
          broadcast={broadcast}
        />
      </div>
    );
  }

  return (
    <div className={classNames(style.Sheet, style.scrollable)}>
      {player.path !== "" ? (
        <>
          <div className={style.fieldRowNoSpread}>
            <div className={style.header}>CORE PATH</div>
            <div style={{ marginLeft: "auto" }}>
              <button
                onClick={() => {
                  updatePlayer({ ...player, path: "" });
                }}
              >
                Change Core Path
              </button>
            </div>
          </div>
          <PathSheet
            player={player}
            updatePlayer={updatePlayer}
            broadcast={broadcast}
          />
        </>
      ) : (
        <>
          <div className={style.header}>SELECT CORE PATH</div>
          <img src={line} />
          <PathSelector player={player} updatePlayer={updatePlayer} />
        </>
      )}

      <div className={style.header}>
        {player.path === "artificer" ? "GADGETS" : "TALENTS"}
      </div>
      <img src={line} />
      {player.talents.map((talent, index) => {
        return (
          <Talent
            talent={talent}
            key={talent.name}
            onRemove={() => {
              const talentsList = player.talents;
              talentsList.splice(index, 1);
              updatePlayer({ ...player, talents: talentsList });
            }}
            onChangeTracker={(tracker, index2) => {
              const talentsList = player.talents;
              if (talentsList[index] && talentsList[index].trackers) {
                talentsList[index].trackers[index2] = tracker;
                updatePlayer({ ...player, talents: talentsList });
              }
            }}
            onBroadcast={() => {
              broadcast(talent);
            }}
          />
        );
      })}
      <button
        className={style.statButton}
        onClick={() => {
          setOpenPath(true);
        }}
      >
        {player.path === "artificer" ? "Add Gadget" : "Add Talent"}
      </button>
    </div>
  );
};
