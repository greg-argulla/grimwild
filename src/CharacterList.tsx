import classNames from "classnames";
import style from "./App.module.css";
import line from "./assets/line.webp";
import logo from "./assets/logo.webp";
import { Player } from "./App";
import OBR from "@owlbear-rodeo/sdk";
import { logoMapping } from "./PathSheet";

export const Character = ({
  player,
  onRemove,
  onOpen,
}: {
  player: Player;
  onRemove: () => void;
  onOpen: () => void;
}) => {
  return (
    <div
      className={classNames(style.fieldContainer)}
      style={{ flexDirection: "row" }}
    >
      <div className={style.characterRow}>
        <img src={logoMapping[player.path.toLowerCase()]} height={40}></img>
        <div className={style.fieldLabel}>PC: </div>
        <input
          className={style.field}
          value={player.name}
          readOnly
          style={{ width: 140 }}
        ></input>
        <div className={style.fieldLabel}>Path: </div>
        <div className={style.header} style={{ width: 100 }}>
          {player.path}
        </div>
        <button
          className={style.statButton}
          style={{ width: 40, marginLeft: "auto" }}
          onClick={() => {
            onOpen();
          }}
        >
          Open
        </button>
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

type Props = {
  playerList: Player[];
  onOpen: (player: Player) => void;
};

const PLAYER = (): Player => {
  return {
    id: Date.now(),
    name: "",
    path: "",
    player: "",
    background1: "",
    background2: "",
    wise1: "",
    wise2: "",
    groupArc: "",
    characterArc: "",
    features: "",
    conditions: "",
    brawn: 0,
    agility: 0,
    wits: 0,
    presence: 0,
    brawnMark: false,
    agilityMark: false,
    witsMark: false,
    presenceMark: false,
    bloodied: false,
    rattled: false,
    story1: false,
    story2: false,
    spark1: false,
    spark2: false,
    experience: 0,
    healingBloodied: 0,
    healingRattled: 0,
    droppedBloodied: false,
    droppedRattled: false,
    trait1: "",
    trait2: "",
    notTrait: "",
    desire1: "",
    desire2: "",
    notDesire: "",
    bonds: [],
    talents: [],
    coreTalent: null,
  };
};

export const CharacterList = ({ playerList, onOpen }: Props) => {
  const addPlayer = async () => {
    const playerGet = PLAYER();
    const metadataData = await OBR.scene.getMetadata();
    const metadata = metadataData[
      "grimwild.character.extension/metadata"
    ] as Record<string, any>;
    let metadataChange = { ...metadata };
    metadataChange[playerGet.id] = playerGet;

    OBR.scene.setMetadata({
      "grimwild.character.extension/metadata": metadataChange,
    });
  };

  const removePlayer = async (id: number) => {
    const metadataData = await OBR.scene.getMetadata();
    const metadata = metadataData[
      "grimwild.character.extension/metadata"
    ] as Record<string, any>;
    let metadataChange = { ...metadata };

    if (confirm("Are you sure you want to delete the character?") == true) {
      delete metadataChange[id];

      OBR.scene.setMetadata({
        "grimwild.character.extension/metadata": metadataChange,
      });
    }
  };

  return (
    <div
      className={classNames(style.Sheet, style.scrollable)}
      style={{ height: 590 }}
    >
      <div className={classNames(style.fieldColumn)}>
        <div
          className={style.fieldRow}
          style={{ alignItems: "center", justifyContent: "space-between" }}
        >
          <img src={logo} className={style.logo} />
          <div className={style.header}>CHARACTER LIST</div>
          <button
            onClick={() => {
              addPlayer();
            }}
            style={{ height: 30 }}
          >
            Add Character
          </button>
        </div>
        <img src={line} />
        {playerList.map((player) => (
          <Character
            key={player.id}
            player={player}
            onRemove={() => {
              removePlayer(player.id);
            }}
            onOpen={() => {
              onOpen(player);
            }}
          />
        ))}
      </div>
    </div>
  );
};
