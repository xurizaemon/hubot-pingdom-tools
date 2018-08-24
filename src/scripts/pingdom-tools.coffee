# Description:
#   Script for interacting with Pingdom Tools.
#
# Dependencies:
#   none
#
# Configuration:
#   none
#
# Commands:
#   hubot is <domain> (fast|slow)? - Request a Pingdom pagetest report on <domain>
#   hubot (pagetest|fpt) <domain> - Request a Pingdom pagetest report on <domain>

pkg = require('../../package.json')
intervals = {}

class PingdomTools

  full_page_test: (msg) ->
    my = this
    fpt_url = 'https://fpt-api.pingdom.com/api/0.1/test?save=false&url='
    fpt_site = msg.match[1]
    msg.http("#{fpt_url}#{fpt_site}")
      .header('referer', 'https://tools.pingdom.com/')
      .header('user-agent', "hubot-pingdom-tools #{pkg.version} (#{pkg.homepage})")
      .get() (err, res, body) ->
        if err
          msg.send('Error: ' + err)
          return
        if body
          if res = JSON.parse body
            if res.poll_state_url
              intervals[res.test_id] = setInterval () ->
                msg.http(res.poll_state_url)
                  .header('referer', 'https://tools.pingdom.com/')
                  .header('user-agent', "hubot-pingdom-tools #{pkg.version} (#{pkg.homepage})")
                  .get() (err, res, poll_body) ->
                    if poll_body
                      poll_res = JSON.parse poll_body
                      if poll_res and poll_res.results and poll_res.state == 'completed'
                        result = poll_res.results
                        replies = []
                        if result.report_url
                          url = result.report_url.replace(/\.com\#!/, '.com/#!') +
                            "/#{msg.match[1]}"
                          replies.push "Full page report: #{url}"
                        if result.pagespeed_score and result.load_time_percentile
                          if result.load_time_percentile >= 50
                            replies.push "Pagespeed score #{result.pagespeed_score}, faster than #{result.load_time_percentile}% of sites."
                          else
                            slower_than = -result.load_time_percentile + 100
                            replies.push "Pagespeed score #{result.pagespeed_score}, slower than #{slower_than}% of sites."
                        if result.page_bytes and result.page_load_time
                          replies.push "#{result.page_bytes} bytes in #{result.page_load_time} ms."
                        if replies.length
                          msg.send(replies.join("\n"))
                        clearInterval intervals[res.test_id]
                    if err
                      robot.log.error err, 'pingdom callback error'
                      msg.send('Error running Pingdom Full Page Test on ' + fpt_site)
                      clearInterval intervals[res.test_id]
              , 2000

client = new PingdomTools

module.exports = (robot) ->
  robot.respond /(pagetest|fpt) ([^ ]*)?$/i, (msg) ->
    client.full_page_test msg

  robot.respond /is ([^ ]*) (fast|slow)/i, (msg) ->
    client.full_page_test msg
