// Description:
//   Script for interacting with Pingdom Tools.

// Dependencies:
//   none

// Configuration:
//   none

// Commands:
//   hubot is <domain> (fast|slow)? - Request a Pingdom pagetest report on <domain>
//   hubot (pagetest|fpt) <domain> - Request a Pingdom pagetest report on <domain>

class PingdomTools {
  full_page_test(msg) {
    var fpt_site, fpt_url, my
    fpt_url = 'https://fpt-api.pingdom.com/api/0.1/test?save=false&url='
    fpt_site = msg.match[2]
    const pkg = require('../package.json')
    return msg.http(`${fpt_url}${fpt_site}`)
      .header('referer', 'https://tools.pingdom.com/')
      .header('user-agent', `hubot-pingdom-tools ${pkg.version} (${pkg.homepage})`)
      .get()((err, res, body) => {
        if (err) {
          msg.send('Error: ' + err)
        }
        if (body) {
          if (res = JSON.parse(body)) {
            if (res.poll_state_url) {
              msg.fpt_interval = setInterval(this.show_result, 2000, res.poll_state_url, msg)
            }
          }
        }
    })
  }

  show_result(url, msg) {
    const pkg = require('../package.json')
    return msg.http(url)
      .header('referer', 'https://tools.pingdom.com/')
      .header('user-agent', `hubot-pingdom-tools ${pkg.version} (${pkg.homepage})`)
      .get()((err, res, poll_body) => {

      var poll_res, replies, result, slower_than
      if (poll_body) {
        poll_res = JSON.parse(poll_body)
        if (poll_res && poll_res.results && poll_res.state === 'completed') {
          result = poll_res.results
          replies = []
          if (result.report_url) {
            url = result.report_url.replace(/\.com\#!/, '.com/#!') + `/${msg.match[1]}`
            replies.push(`Full page report: ${url}`)
          }
          if (result.pagespeed_score && result.load_time_percentile) {
            if (result.load_time_percentile >= 50) {
              replies.push(`Pagespeed score ${result.pagespeed_score}, faster than ${result.load_time_percentile}% of sites.`)
            } else {
              slower_than = -result.load_time_percentile + 100
              replies.push(`Pagespeed score ${result.pagespeed_score}, slower than ${slower_than}% of sites.`)
            }
          }
          if (result.page_bytes && result.page_load_time) {
            replies.push(`${result.page_bytes} bytes in ${result.page_load_time} ms.`)
          }
          if (replies.length) {
            msg.send(replies.join("\n"))
          }

          clearInterval(msg.fpt_interval)
        }
      }
      if (err) {
        msg.send('Error running Pingdom Full Page Test on ' + url)
        robot.logger.error(err, 'Pingdom FPT Error')
        clearInterval(msg.fpt_interval)
      }
    })
  }
}

module.exports = function(robot) {
  let pt = new PingdomTools(robot)

  // robot.hear(/(wrms search|search wrms( for)?) (.*)$/i, (msg) => {
  robot.respond(/(pagetest|fpt) ([^ ]*)?$/i, function(msg) {
    return pt.full_page_test(msg)
  })
  return robot.respond(/is ([^ ]*) (fast|slow)/i, function(msg) {
    return pt.full_page_test(msg)
  })
}
