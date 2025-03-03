import classNames from "classnames";
import style from "./App.module.css";
import { ChangeEvent } from "react";
import line from "./assets/line.webp";
import line2 from "./assets/line2.webp";
import { Bond, Chat, Player } from "./App";
import { addRoll } from "./ChatBoard";

export const Field = ({
  label,
  onChange,
  value,
  className,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  className?: string;
}) => {
  return (
    <div className={classNames(style.fieldContainer, className)}>
      <div className={style.fieldLabel}>{label}</div>
      <input
        className={style.field}
        type="text"
        onChange={(e) => {
          onChange(e.target.value);
        }}
        value={value}
      ></input>
    </div>
  );
};

export const TextArea = ({
  label,
  onChange,
  rows = 4,
  value,
  width = 200,
}: {
  label: string;
  onChange: (value: string) => void;
  rows?: number;
  value: string;
  width?: number;
}) => {
  return (
    <div className={style.fieldContainer}>
      <div className={style.fieldLabel}>{label}</div>
      <textarea
        className={style.field}
        style={{ width: width }}
        rows={rows}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        value={value}
      ></textarea>
    </div>
  );
};

export const FieldStat = ({
  label,
  onChangeValue,
  onChangeMark,
  value,
  marked,
  myChat,
  id,
  onRoll,
  player,
}: {
  label: string;
  value: number;
  marked: boolean;
  myChat: Chat[];
  id: string;
  onChangeValue: (value: string) => void;
  onChangeMark: (value: boolean) => void;
  onRoll: () => void;
  player: Player;
}) => {
  return (
    <div className={style.fieldStatContainer}>
      <div className={style.fieldStatLabel}>
        <b>{label}</b>
      </div>
      <input
        className={style.fieldStat}
        onChange={(e) => {
          onChangeValue(e.target.value);
        }}
        value={value}
      ></input>
      <div className={style.fieldStatContainerSmall}>
        <div className={style.fieldStatLabel}>Marked</div>
        <input
          type="checkbox"
          checked={marked}
          onChange={() => {
            onChangeMark(!marked);
          }}
        />
      </div>
      <button
        className={style.statButton}
        onClick={() => {
          let thornCount = 0;

          if (player.bloodied) {
            thornCount++;
          } else if (marked && (label === "Brawling" || label === "Agility")) {
            thornCount++;
            onChangeMark(false);
          }

          if (player.rattled) {
            thornCount++;
          } else if (marked && (label === "Wits" || label === "Presence")) {
            thornCount++;
            onChangeMark(false);
          }

          addRoll({
            diceCount: value,
            thornsCount: thornCount,
            myChat,
            id,
            player: player.name,
            role: "PLAYER",
          });

          onRoll();
        }}
      >
        Roll
      </button>
    </div>
  );
};

export const FieldRoller = ({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) => {
  return (
    <div className={style.fieldRollerContainer}>
      <b>{label}</b>
      <input
        className={style.fieldStat}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        value={value}
      ></input>
    </div>
  );
};

export const FieldStatSmall = ({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: number) => void;
  value: number;
}) => {
  return (
    <div className={style.fieldStatContainerSmall}>
      <div className={style.fieldStatLabel}>{label}</div>
      <input
        className={style.fieldStat}
        onChange={(e) => {
          const val = parseInt(e.target.value);
          onChange(!isNaN(val) ? val : 0);
        }}
        value={value}
      ></input>
    </div>
  );
};

export const FieldCheckDetails = ({
  label,
  onChange,
}: {
  label: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
}) => {
  return (
    <div className={classNames(style.fieldRow)}>
      <input type="checkbox" onChange={onChange} />
      {label}
    </div>
  );
};

const TraitOptions = [
  "Brave",
  "Caring",
  "Confident",
  "Curious",
  "Gentle",
  "Honest",
  "Honorable",
  "Persistent",
  "Quiet",
  "Protective",
  "Rash",
  "Stubborn",
];

const DesireOptions = [
  "Justice",
  "Glory",
  "Harmony",
  "Honor",
  "Knowledge",
  "Love",
  "Power",
  "Renown",
  "Thrills",
  "Wealth",
  "Wisdom",
];

const IntensityOptions = [
  "Deep",
  "Complex",
  "Growing",
  "Lowkey",
  "Playful",
  "Tense",
];

const NatureOptions = [
  "Affection",
  "Camaraderie",
  "Curiosity",
  "Doubts",
  "Respect",
  "Rivalry",
];

export const CustomSelectField = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (event: string) => void;
  options: string[];
}) => {
  if (!options.includes(value) && value !== "") {
    return (
      <input
        className={style.fieldSmall}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
      ></input>
    );
  }

  return (
    <select
      onChange={(e) => {
        onChange(e.target.value);
      }}
      value={value}
    >
      {options.map((item) => (
        <option value={item}>{item}</option>
      ))}
      <option value="Custom">Custom</option>
    </select>
  );
};

export const BondField = ({
  onChange,
  onRemove,
  bond,
}: {
  bond: Bond;
  onChange: (value: Bond) => void;
  onRemove: () => void;
}) => {
  return (
    <div className={classNames(style.fieldContainer, style.fieldFullWidth)}>
      <div className={style.fieldRowNoSpread}>
        <div className={style.fieldLabel}>PC: </div>
        <input
          className={style.field}
          type="text"
          onChange={(e) => {
            onChange({ ...bond, name: e.target.value });
          }}
          value={bond.name}
        ></input>
        <CustomSelectField
          value={bond.intensity}
          onChange={(value) => {
            onChange({ ...bond, intensity: value });
          }}
          options={IntensityOptions}
        />
        <CustomSelectField
          value={bond.nature}
          onChange={(value) => {
            onChange({ ...bond, nature: value });
          }}
          options={NatureOptions}
        />
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

const calculateTalents = (experience: number) => {
  const thresholds = [2, 5, 9, 14, 20, 27]; // Cumulative XP needed for each talent
  let talents = 1;

  for (let i = 0; i < thresholds.length; i++) {
    if (experience >= thresholds[i]) {
      talents++;
    } else {
      break;
    }
  }

  return talents;
};

const calculateXPLeft = (experience: number) => {
  const thresholds = [2, 5, 9, 14, 20, 27]; // Cumulative XP needed for each talent

  for (let i = 0; i < thresholds.length; i++) {
    if (experience < thresholds[i]) {
      return thresholds[i] - experience;
    }
  }
  return 0;
};

// const computeExp = (value: number) => {};

export const CharacterSheet = ({
  player,
  updatePlayer,
  myChat,
  id,
  onRoll,
}: {
  player: Player;
  updatePlayer: (player: Player) => void;
  myChat: Chat[];
  id: string;
  onRoll: () => void;
}) => {
  return (
    <div className={classNames(style.Sheet, style.scrollable)}>
      <div className={style.header}>CHARACTER</div>
      <img src={line} />
      <div className={classNames(style.fieldRow, style.fieldFullWidth)}>
        <div className={classNames(style.fieldColumn, style.fieldFullWidth)}>
          <Field
            label="Name"
            onChange={(value) => {
              updatePlayer({ ...player, name: value });
            }}
            value={player.name}
          />
          <Field
            label="Player"
            onChange={(value) => {
              updatePlayer({ ...player, player: value });
            }}
            value={player.player}
          />
        </div>
        <div className={style.fieldFullColumn}>
          <TextArea
            label="Distinct Features"
            onChange={(value) => {
              updatePlayer({ ...player, features: value });
            }}
            value={player.features}
          />
        </div>
      </div>
      <img src={line2} />
      <div className={style.header}>STATS</div>
      <img src={line} />
      <div className={classNames(style.fieldRow)}>
        <div className={classNames(style.fieldColumn, style.statContainer)}>
          <div className={classNames(style.fieldRow)}>
            <FieldStat
              label={"Brawn"}
              onChangeMark={(mark) => {
                updatePlayer({ ...player, brawnMark: mark });
              }}
              value={player.brawn}
              marked={player.brawnMark}
              onChangeValue={function (value: string): void {
                const num = parseInt(value.charAt(value.length - 1));
                updatePlayer({ ...player, brawn: !isNaN(num) ? num : 0 });
              }}
              myChat={myChat}
              id={id}
              onRoll={onRoll}
              player={player}
            />
            <FieldStat
              label={"Agility"}
              onChangeMark={(mark) => {
                updatePlayer({ ...player, agilityMark: mark });
              }}
              value={player.agility}
              marked={player.agilityMark}
              onChangeValue={function (value: string): void {
                const num = parseInt(value.charAt(value.length - 1));
                updatePlayer({ ...player, agility: !isNaN(num) ? num : 0 });
              }}
              myChat={myChat}
              id={id}
              onRoll={onRoll}
              player={player}
            />
            <FieldStat
              label={"Wits"}
              onChangeMark={(mark) => {
                updatePlayer({ ...player, witsMark: mark });
              }}
              value={player.wits}
              marked={player.witsMark}
              onChangeValue={function (value: string): void {
                const num = parseInt(value.charAt(value.length - 1));
                updatePlayer({ ...player, wits: !isNaN(num) ? num : 0 });
              }}
              myChat={myChat}
              id={id}
              onRoll={onRoll}
              player={player}
            />
            <FieldStat
              label={"Presence"}
              onChangeMark={(mark) => {
                updatePlayer({ ...player, presenceMark: mark });
              }}
              value={player.presence}
              marked={player.presenceMark}
              onChangeValue={function (value: string): void {
                const num = parseInt(value.charAt(value.length - 1));
                updatePlayer({ ...player, presence: !isNaN(num) ? num : 0 });
              }}
              myChat={myChat}
              id={id}
              onRoll={onRoll}
              player={player}
            />
          </div>
          <div className={classNames(style.fieldRow)}>
            Bloodied{" "}
            <input
              type="checkbox"
              checked={player.bloodied}
              onChange={() => {
                updatePlayer({ ...player, bloodied: !player.bloodied });
              }}
            />
            Rattled{" "}
            <input
              type="checkbox"
              checked={player.rattled}
              onChange={() => {
                updatePlayer({ ...player, rattled: !player.rattled });
              }}
            />
          </div>
          <div className={style.statDetail}>
            <b>Critical</b>:<br /> Greater Effect (Drop 1) - Secondary Effect-
            Setup
          </div>
        </div>
        <div className={classNames(style.fieldColumn, style.statContainer)}>
          <b>Healing</b>
          <FieldStatSmall
            label={"Bloodied"}
            onChange={(value) => {
              updatePlayer({ ...player, healingBloodied: value });
            }}
            value={player.healingBloodied}
          />
          <div className={style.fieldStatContainerSmall}>
            <div className={style.fieldStatLabel}>Dropped</div>
            <input
              type="checkbox"
              checked={player.droppedBloodied}
              onChange={() => {
                updatePlayer({
                  ...player,
                  droppedBloodied: !player.droppedBloodied,
                });
              }}
            />
          </div>
          <FieldStatSmall
            label={"Rattled"}
            onChange={(value) => {
              updatePlayer({ ...player, healingRattled: value });
            }}
            value={player.healingRattled}
          />
          <div className={style.fieldStatContainerSmall}>
            <div className={style.fieldStatLabel}>Dropped</div>
            <input
              type="checkbox"
              checked={player.droppedRattled}
              onChange={() => {
                updatePlayer({
                  ...player,
                  droppedRattled: !player.droppedRattled,
                });
              }}
            />
          </div>
        </div>
        <div className={classNames(style.fieldColumn)}>
          <div className={classNames(style.fieldColumn, style.statContainer)}>
            <div className={classNames(style.fieldRow)}>
              <b>Story</b>{" "}
              <input
                type="checkbox"
                checked={player.story1}
                onChange={() => {
                  updatePlayer({
                    ...player,
                    story1: !player.story1,
                  });
                }}
              />{" "}
              <input
                type="checkbox"
                checked={player.story2}
                onChange={() => {
                  updatePlayer({
                    ...player,
                    story2: !player.story2,
                  });
                }}
              />
            </div>
            <div className={classNames(style.fieldRow)}>
              <b>Spark</b>{" "}
              <input
                type="checkbox"
                checked={player.spark1}
                onChange={() => {
                  updatePlayer({
                    ...player,
                    spark1: !player.spark1,
                  });
                }}
              />{" "}
              <input
                type="checkbox"
                checked={player.spark2}
                onChange={() => {
                  updatePlayer({
                    ...player,
                    spark2: !player.spark2,
                  });
                }}
              />
            </div>
          </div>
          <div
            className={classNames(style.fieldColumn, style.statContainer)}
            style={{ textAlign: "center" }}
          >
            <b>Experience</b>
            <div className={style.fieldStatContainerSmall}>
              <input
                className={style.fieldStat}
                value={player.experience}
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  updatePlayer({
                    ...player,
                    experience: !isNaN(num) ? num : 0,
                  });
                }}
              ></input>
              <div className={style.fieldStatLabel}>Each session, take 1xp</div>
              <div className={style.talentCount}>
                {calculateTalents(player.experience)}
              </div>
              <div className={style.fieldStatLabel}>
                Level & Non-Core Talents Unlocked
              </div>
              <div className={style.talentCount}>
                {calculateXPLeft(player.experience)}
              </div>
              <div className={style.fieldStatLabel}>XP to next level</div>
            </div>
          </div>
        </div>
      </div>

      <div className={classNames(style.fieldColumn, style.statContainer)}>
        <b>Conditions</b>
        <textarea
          className={style.fieldConditions}
          rows={1}
          onChange={(e) => {
            updatePlayer({ ...player, conditions: e.target.value });
          }}
          value={player.conditions}
        ></textarea>
        <div className={style.statDetail}>
          <b>Vex</b>: Fight - Flight - Freeze- Freakout
        </div>
      </div>

      <img src={line2} />
      <div className={style.fieldRowNoSpread}>
        <div className={style.header}>DETAILS</div>
        <div className={style.statDetail}>Introduce a tangle: take a spark</div>
      </div>
      <img src={line} />
      <div className={style.fieldRow}>
        <div className={classNames(style.fieldColumn, style.fieldFullWidth)}>
          <Field
            label="Background #1"
            onChange={(value) => {
              updatePlayer({ ...player, background1: value });
            }}
            value={player.background1}
          />

          <Field
            label="Wises"
            onChange={(value) => {
              updatePlayer({ ...player, wise1: value });
            }}
            value={player.wise1}
          />
        </div>
      </div>
      <img src={line2} />
      <div className={style.fieldRow}>
        <div className={classNames(style.fieldColumn, style.fieldFullWidth)}>
          <Field
            label="Background #2"
            onChange={(value) => {
              updatePlayer({ ...player, background2: value });
            }}
            value={player.background2}
          />

          <Field
            label="Wises"
            onChange={(value) => {
              updatePlayer({ ...player, wise2: value });
            }}
            value={player.wise2}
          />
        </div>
      </div>
      <img src={line2} />
      <div className={classNames(style.fieldColumn, style.statContainer)}>
        <b>Traits</b>
        <div className={classNames(style.fieldColumn)} style={{ fontSize: 15 }}>
          <div className={classNames(style.fieldRowNoSpread)}>
            <div className={style.fieldStatLabel}>2 you are</div>
            <CustomSelectField
              value={player.trait1}
              onChange={(value) => {
                updatePlayer({ ...player, trait1: value });
              }}
              options={TraitOptions}
            />
            <CustomSelectField
              value={player.trait2}
              onChange={(value) => {
                updatePlayer({ ...player, trait2: value });
              }}
              options={TraitOptions}
            />
            <div className={style.fieldStatLabel}>1 you're really not</div>
            <CustomSelectField
              value={player.notTrait}
              onChange={(value) => {
                updatePlayer({ ...player, notTrait: value });
              }}
              options={TraitOptions}
            />
          </div>
        </div>

        <b>Desires</b>
        <div className={classNames(style.fieldColumn)} style={{ fontSize: 15 }}>
          <div className={classNames(style.fieldRowNoSpread)}>
            <div className={style.fieldStatLabel}>2 you want</div>
            <CustomSelectField
              value={player.desire1}
              onChange={(value) => {
                updatePlayer({ ...player, desire1: value });
              }}
              options={DesireOptions}
            />
            <CustomSelectField
              value={player.desire2}
              onChange={(value) => {
                updatePlayer({ ...player, desire2: value });
              }}
              options={DesireOptions}
            />
            <div className={style.fieldStatLabel}>1 you really don't</div>
            <CustomSelectField
              value={player.notDesire}
              onChange={(value) => {
                updatePlayer({ ...player, notDesire: value });
              }}
              options={DesireOptions}
            />
          </div>
        </div>
      </div>

      <img src={line2} />

      <div className={style.fieldRowNoSpread}>
        <div className={style.header}>BONDS</div>
        <div className={style.statDetail}>
          Change a bond: The other PC takes spark | Quarrel: Both take spark
        </div>
      </div>

      <img src={line} />
      <div className={style.fieldColumn}>
        {player.bonds?.map((bond, index) => {
          return (
            <BondField
              key={"bond" + index}
              bond={bond}
              onChange={(bond) => {
                const bondList = player.bonds;
                const index = bondList.findIndex((item) => item.id === bond.id);
                bondList[index] = bond;
                updatePlayer({ ...player, bonds: bondList });
              }}
              onRemove={() => {
                const bondList = player.bonds;
                const index = bondList.findIndex((item) => item.id === bond.id);
                bondList.splice(index, 1);
                updatePlayer({ ...player, bonds: bondList });
              }}
            />
          );
        })}

        <button
          className={style.statButton}
          onClick={() => {
            const bonds: Bond[] = [
              ...player.bonds,
              {
                id: Date.now(),
                name: "",
                intensity: "",
                nature: "",
              },
            ];
            updatePlayer({ ...player, bonds: bonds });
          }}
        >
          Add PC Bond
        </button>
      </div>

      <img src={line2} />
      <div className={style.fieldRowNoSpread}>
        <div className={style.header}>STORY ARCS</div>
        <div className={style.statDetail}>Finish or move on: take a spark</div>
      </div>
      <img src={line} />
      <div className={classNames(style.fieldFullWidth, style.fieldColumn)}>
        <Field
          label="Group Arc"
          onChange={(value) => {
            updatePlayer({ ...player, groupArc: value });
          }}
          value={player.groupArc}
        />
        <Field
          label="Character Arc"
          onChange={(value) => {
            updatePlayer({ ...player, characterArc: value });
          }}
          value={player.characterArc}
        />
      </div>
      <img src={line} />
      <div className={style.fieldRowNoSpread}>
        <div className={style.header}>OTHER</div>
        <div className={style.statDetail}>
          Arcana, Character Notes, Notable Items
        </div>
      </div>
      <img src={line} />
      <TextArea
        label={""}
        onChange={(value) => {
          updatePlayer({ ...player, bio: value });
        }}
        value={player.bio}
        width={450}
      ></TextArea>
    </div>
  );
};
