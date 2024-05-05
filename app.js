const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const dbPath = path.join(__dirname, 'cricketTeam.db')
//initialize db and sever
let db = null
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Started!!')
    })
  } catch (e) {
    console.log(`Error: ${e.message}`)
  }
}
initializeDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// api 1 Returns a list of all players in the team

app.get('/players/', async (request, response) => {
  const getAllPlayersQuery = `
  select
    *
  from
    cricket_team;
  `
  const allPlayers = await db.all(getAllPlayersQuery)
  response.send(
    allPlayers.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

//api 2 Creates a new player in the team (database). `player_id` is auto-incremented
/*{
  "playerName": "Vishal",
  "jerseyNumber": 17,
  "role": "Bowler"
}
*/
let playerId = 12

app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayerQuery = `
  insert into cricket_team(player_id,player_name,jersey_number,role)
  values (${++playerId},'${playerName}',${jerseyNumber},'${role}'
  );
  `
  await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})

//api 3 Returns a player based on a player ID
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerDetailsQuery = `
  select 
    *
  from
    cricket_team
  where player_id = ${playerId};
  `
  let playerDetails = await db.get(getPlayerDetailsQuery)
  /*response.send(playerDetails)
  console.log(playerDetails.player_id)
  console.log(convertDbObjectToResponseObject(playerDetails))*/
  response.send(convertDbObjectToResponseObject(playerDetails))
})

// api 4 Updates the details of a player in the team (database) based on the player ID

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const updatedPlayerDetails = request.body
  const {playerName, jerseyNumber, role} = updatedPlayerDetails

  const updatePlayerQuery = `
  update cricket_team
  set 
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  where player_id = ${playerId};
  `

  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//api 5 Deletes a player from the team (database) based on the player ID
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  delete
  from
    cricket_team
  where player_id = ${playerId};
  `
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
