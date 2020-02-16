import "date-fns";
import React, { useState, useEffect } from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import Button from "components/CustomButtons/Button.js";
import CustomInput from "components/CustomInput/CustomInput.js";
import CustomInputSelect from "components/CustomInput/CustomInputSelect.js";

import { SnackbarProvider, useSnackbar } from "notistack";

import Amplify, { API, graphqlOperation } from "aws-amplify";
import awsconfig from "./../../aws-exports";

import { listGamedays, listPlayers } from "./../../graphql/queries";
import { createGameday } from "./../../graphql/mutations";
import { onCreateGameday } from "./../../graphql/subscriptions";

import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker
} from "@material-ui/pickers";

Amplify.configure(awsconfig);

const styles = {
  cardCategoryWhite: {
    "&,& a,& a:hover,& a:focus": {
      color: "rgba(255,255,255,.62)",
      margin: "0",
      fontSize: "14px",
      marginTop: "0",
      marginBottom: "0"
    },
    "& a,& a:hover,& a:focus": {
      color: "#FFFFFF"
    }
  },
  cardTitleWhite: {
    color: "#FFFFFF",
    marginTop: "0px",
    minHeight: "auto",
    fontWeight: "300",
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    marginBottom: "3px",
    textDecoration: "none",
    "& small": {
      color: "#777",
      fontSize: "65%",
      fontWeight: "400",
      lineHeight: "1"
    }
  }
};

const useStyles = makeStyles(styles);

//https://dev.to/joemsak/barebones-aws-amplify-react-graphql-app-5ae8
function Games() {
  const [gameDayItems, setGameDayItems] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [selectedGameDay, setSelectedGameDay] = useState([]);
  const [gameItems, setGameItems]             = useState([]);

  const [playerItems, setPlayerItems] = useState([]);
  const [selectedPlayer1, setSelectedPlayer1] = useState('');
  const [selectedPlayer2, setSelectedPlayer2] = useState('');

  
  const { enqueueSnackbar } = useSnackbar();

  const readGameDays = async () => {
    const allGameDays = await API.graphql(graphqlOperation(listGamedays));
    console.log(allGameDays.data.listGamedays.items);

    const allGameDayItems = allGameDays.data.listGamedays.items;

    const tableArray = allGameDayItems.map(item => {
      console.log(item.id, item.date);
      return [item.id, item.date];
    });

    tableArray.sort(function(a, b) {
      return a.id - b.id;
    });

    setGameDayItems(tableArray);
  };

  const readPlayers = async () => {
    const allPlayers = await API.graphql(graphqlOperation(listPlayers));
    console.log(allPlayers.data.listPlayers.items);

    const allPlayersItems = allPlayers.data.listPlayers.items;

    setPlayerItems(allPlayersItems);

  };

  const addGameDay = async () => {
    const d = selectedDate;
    const gameDayDateString = [
      d.getFullYear(),
      "-",
      ("0" + (d.getMonth() + 1)).slice(-2),
      "-",
      ("0" + d.getDate()).slice(-2)
    ].join("");
    console.log(gameDayDateString);

    await API.graphql(
      graphqlOperation(createGameday, {
        input: { id: gameDayDateString, date: gameDayDateString }
      })
    );
  };

  const subscripeGameDay = async () => {
    await API.graphql(graphqlOperation(onCreateGameday)).subscribe({
      next: subonCreateGameday => {
        console.log("subscription", subonCreateGameday);
        const variant = "success";
        enqueueSnackbar(
          "Gamday created: " + subonCreateGameday.value.data.onCreateGameday.id,
          { variant }
        );

        setGameDayItems(gameDayItems => [
          ...gameDayItems,
          [
            subonCreateGameday.value.data.onCreateGameday.id,
            subonCreateGameday.value.data.onCreateGameday.date
          ]
        ]);

        /*
        newGameDayList.sort(function(a, b) {
          return a.id - b.id;
        });

        setGameDayItems(newGameDayList)
        */
      }
    });
  };

  useEffect(() => {
    readGameDays();
    subscripeGameDay();
    readPlayers();
  }, []);

  function onClickCreateGameDay() {
    console.log("create GameDay: " + selectedDate);
    addGameDay();
  }

  function onClickCreateGame() {
    console.log("create Game: ");
    console.log(selectedPlayer1);
    console.log(selectedPlayer2);
  }

  const classes = useStyles();

  const handleDateChange = date => {
    setSelectedDate(date);
  };

  const handleGameDaySelection = (event, key) => {
    console.log(gameDayItems[key]);

    setSelectedGameDay(gameDayItems[key])

    const games = [
      [key.toString(), gameDayItems[key][0]],
    ];
    setGameItems(games)

  };

  const handleSelectedPlayer1 = (player) => {
    console.log("1" + player);

    setSelectedPlayer1(player)
  };

  const handleSelectedPlayer2 = (player) => {
    console.log("2" + player);

    setSelectedPlayer2(player)
  };

  return (
    <GridContainer>
      {/* GameDays */}

      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary">
            <GridContainer justify="flex-start">
              <GridItem xs={12} sm={12} md={12}>
                <h4 className={classes.cardTitleWhite}>Gamedays</h4>
                <p className={classes.cardCategoryWhite}>
                  Whenever wherever games happend
                </p>
              </GridItem>
            </GridContainer>
            <GridContainer justify="flex-end">
              <GridItem xs={12} sm={12} md={12}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    disableToolbar
                    variant="inline"
                    format="dd.MM.yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="Date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    KeyboardButtonProps={{
                      "aria-label": "change date"
                    }}
                  />
                </MuiPickersUtilsProvider>

                <Button onClick={onClickCreateGameDay} color="primary">
                  Create a Gameday
                </Button>
              </GridItem>
            </GridContainer>
          </CardHeader>
          <CardBody>
            <Table
              tableHeaderColor="primary"
              tableHead={["Id", "Date"]}
              tableData={gameDayItems}
              selectedRow={handleGameDaySelection}
            />
          </CardBody>
        </Card>
      </GridItem>

      {/* Games */}

      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary">
            <GridContainer justify="space-between" spacing={2}>
              <GridItem xs={12} sm={12} md={12}>
                  <h4 className={classes.cardTitleWhite}>Games {selectedGameDay[1]}</h4>
                <p className={classes.cardCategoryWhite}>
                  All games per GameDay
                </p>
              </GridItem>
            </GridContainer>

            <GridContainer justify="space-between" spacing={2}>
              <GridContainer>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInputSelect
                    labelText="Player1"
                    id="player1"
                    formControlProps={{
                      fullWidth: true
                    }}
                    menuItems={playerItems}
                    selectedPlayer={handleSelectedPlayer1}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={3}>
                  <CustomInputSelect
                    labelText="Player2"
                    id="player2"
                    formControlProps={{
                      fullWidth: true
                    }}
                    menuItems={playerItems}
                    selectedPlayer={handleSelectedPlayer2}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    labelText="ResultPlayer1"
                    id="resultPlayer1"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      type: "number"
                    }}
                  />
                </GridItem>
                <GridItem xs={12} sm={12} md={2}>
                  <CustomInput
                    labelText="ResultPlayer2"
                    id="resultPlayer2"
                    formControlProps={{
                      fullWidth: true
                    }}
                    inputProps={{
                      type: "number"
                    }}
                  />
                </GridItem>

                <GridItem xs={12} sm={12} md={12}>
                  <Button onClick={onClickCreateGame} color="primary">
                    Create a Game
                  </Button>
                </GridItem>
              </GridContainer>
            </GridContainer>
          </CardHeader>
          <CardBody>
            <Table
              tableHeaderColor="primary"
              tableHead={[
                "Id",
                "Player1",
                "Player2",
                "ResultPlayer1",
                "ResultPlayer2"
              ]}
              tableData={gameItems}
            />
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer>
  );
}

//export default Games;

export default function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <Games />
    </SnackbarProvider>
  );
}
