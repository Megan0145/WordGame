import React, { useState, useEffect, useRef } from "react";
import { Board, GameDetails } from "./GameComponents";
import axios from 'axios';
import {getUrl} from '../../data/urlController';
import "./game.css";

const Game = () => {
  const [wordOnTiles, setWordsOnTiles] = useState([
    "r",
    "e",
    "s",
    "u",
    "l",
    "t"
  ]);
  const [rowsOfWordsToFill, setRowsOfWordsToFill] = useState(8);
  const [currentWordsRow, setCurrentWordsRow] = useState(-1);
  const [wordsInRows, setWordsInRows] = useState(
    Array(rowsOfWordsToFill).fill(null)
  );
  const [textEnteredInInput, setTextEnteredInInput] = useState("");
  const timeAllotedForGame = "30";
  const [timer, setTimer] = useState("00");
  const [myTurn, setMyTurn] = useState(false);
  const [gameStatus, setGameStatus] = useState("ready"); //could be 'started','ended','paused' or 'disconnected' or 'terminated'

  const intervalRef = useRef();

  const settings = {
    single_player: {
      timer: true,
      timer_limit: 30,
      game_mode: "easy" //could be medium or hard
    },
    multi_player: {
      timer: true,
      timer_limit: 30,
      game_mode: "easy"
    }
  };

  const game_mode = "multi_player";
  useEffect(() => {
    const newRow = currentWordsRow + 1;
    setCurrentWordsRow(newRow);

    if (gameStatus === "started") {
      if (!myTurn) {
        // alert(myTurn);

        simulateComputerPlay(newRow);

        setMyTurn(true);
      }
    }
  }, [wordsInRows]);

  useEffect(() => {
    let sec = timer;
    let secInNum = Number(sec);
    const refToSetTimer = setTimeout(() => {
      if (secInNum !== 0) {
        secInNum -= 1;
        if (secInNum < 10) sec = "0" + secInNum;
        else sec = secInNum;
      }

      setTimer(sec);
    }, 1000);

    intervalRef.current = refToSetTimer;

    if (secInNum === 0) clearInterval(intervalRef.current);
  }, [timer]);

  const startGame = () => {
    //set player turn
    setMyTurn(true);
    //start count down timer
    setTimer(timeAllotedForGame);
    setGameStatus("started");
  };

  const displayWordEntered = (currentWordsRow, enteredWord) => {
    let newWordsInRow = [...wordsInRows];
    console.log("currWiR ", currentWordsRow);
    newWordsInRow[currentWordsRow] = enteredWord;
    setWordsInRows(newWordsInRow);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setTimer(timeAllotedForGame);
  };

  const getWordList = word => {
    setWordsOnTiles(word.split(""));
  };

  const handleFormSubmit = async e => {
    e.preventDefault();
    if (currentWordsRow === rowsOfWordsToFill) return;
    const resp = await validateWord(textEnteredInInput);
    const { exists } = resp;
    if(!exists) {
      setTextEnteredInInput("");
      return;
    }
    //Display word on the board
    displayWordEntered(currentWordsRow, textEnteredInInput);
    //Empty Input
    setTextEnteredInInput("");
    //move to the next row
    const newCurrentRow = currentWordsRow + 1;
    //setCurrentWordsRow(newCurrentRow);
    //determin who's turn it is to play
    setMyTurn(false);
    // simulateComputerPlay(newCurrentRow);
  };

  const validateWord = word => {
    return new Promise((resolve, reject) => {
      console.log(wordOnTiles.join("") + " has "+ word + "i n it ?" );

      // const wordOnTilesToString = wordOnTiles.join("")
      // const pattern = `^[${wordOnTilesToString}]+$;`;
      // console.log(pattern)
      // const regExpression = new RegExp(pattern);
      // console.log(typeof regExpression)
      // const wordsInSampleWord = word.match(regExpression)

      // console.log(wordsInSampleWord)
      // if (!wordsInSampleWord)  return resolve({exists:false});
      const url = getUrl("word_validate_url") +"/" +word;
      axios
      .get(url)
      .then(response =>{
        resolve(response)
      })
      .catch(err => {
        reject(err)
        console.log(err)
      })

    });
  };

  const determineNextPlayer = () => {};
  const getRandomWords = () => {
    const words = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const noOfWords = Math.trunc(1 + Math.random() * 10);
    let word = "";
    console.log("noOfWords --> ", noOfWords);

    for (let i = 0; i < noOfWords; i++) {
      word = words[Math.trunc(1 + Math.random() * 25)];
    }

    return word;
  };
  const simulateComputerPlay = newRow => {
    const { timer, timer_limit } = settings[game_mode];
    console.log(timer_limit);
    const time = Math.trunc(1 + Math.random() * timer_limit);

    console.log(time);

    const randomWordsTimeout = setTimeout(() => {
      const randWord = getRandomWords();
      console.log(randWord);

      displayWordEntered(newRow, randWord);

      //set row to the next
      setMyTurn(true);

      resetTimer();
    }, 3 * 1000);
  };

  const handleFormChange = e => {
    const value = e.target.value;

    setTextEnteredInInput(value);
    // setTextEnteredInInput(textEnteredInInput => value)
  };

  return (
    <div className="container">
      <header></header>
      <section className="board-container">
        <Board
          letters={wordOnTiles}
          rowsOfWordsToFill={rowsOfWordsToFill}
          wordsInRows={wordsInRows}
          handleFormChange={handleFormChange}
          handleFormSubmit={handleFormSubmit}
          textEnteredInInput={textEnteredInInput}
          enableInput={myTurn}
        />
        <GameDetails timer={timer} />
      </section>
      <button onClick={startGame}>click</button>
    </div>
  );
};

export default Game;
