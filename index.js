const mineflayer = require('mineflayer')
const { pathfinder, Movements } = require('mineflayer-pathfinder')
const { GoalNear, GoalBlock, GoalGetToBlock, GoalLookAtBlock, GoalXZ, GoalY, GoalInvert, GoalFollow } = require('mineflayer-pathfinder').goals
const { Vec3 } = require('vec3');

function configureBot(bot) {

  // Configure the bot to have access to Mineflayer modules/plugins
  console.log("Bot configuring...")
  bot.loadPlugin(pathfinder)
  const mcData = require('minecraft-data')(bot.version)
  const defaultMove = new Movements(bot, mcData)
  console.log("Bot configuration done!")

  // Finds a block of the given type, within 50 blocks from the bot
  function findBlock(blockType) {
    // Finds the location of the blocks
    bot.chat("Trying to find " + blockType)
    let blockLocations = bot.findBlocks({
      point: bot.entity.position,
      matching: (block) => {
        // Match any block where the given name is included in the block name
        return block.name.toLowerCase().includes(blockType.toLowerCase()) ||
          block.displayName.toLowerCase().includes(blockType.toLowerCase());
      },
      maxDistance: 50,
      count: 1
    })
    bot.chat(JSON.stringify(blockLocations))
    if (blockLocations.length > 0) {
      return bot.blockAt(blockLocations[0])
    }
    return null
  }

  function digBlock(block) {
    bot.dig(bot.blockAt(block.position)) // We do this in case the block changed by the time we got there
      .then(() => {
        console.log('I dug up a ' + block.displayName)
      })
      .catch(err => {
        console.error('ERROR, I had problem trying to dig ' + block.displayName, err)
      })
  }

  function travelToBlock(block) {
    bot.pathfinder.setMovements(defaultMove)
    return new Promise(function(resolve, reject) {
      bot.pathfinder.goto(new GoalLookAtBlock(block.position, bot.world, { reach: 4 }))
        .then(() => {
          bot.chat("Got to the block! Now what?")
          digBlock(block)
        })
        .catch((err) => {
          console.error('ERROR, I had pathfinding problem trying to navigate', err)
          reject(new Error("Couldn't get to block"))
        })
    })
  }

  bot.on('chat', (username, message) => {
    if (username === bot.username) return
    if (message === "find wood") {
      const block = findBlock("LOG")
      if (block) {
        console.log(block)
        bot.chat(`I found a block of type ${block.displayName} at location ${JSON.stringify(block.position)}`)
        travelToBlock(block)
      } else {
        bot.chat("I couldn't find that kind of block!")
      }
    }
  })

}

exports.configureBot = configureBot