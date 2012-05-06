Highcharts.setOptions({ global: { useUTC: false }});  // Display graph in viewer's Timezone

var chart;
var num_of_points = 300;
$(document).ready(function() {
  chart = new Highcharts.Chart({
    chart: {
      renderTo: 'plot-container',
      defaultSeriesType: 'line',
      marginRight: 100,
    },
    title: {
      text: 'Redis Server State'
    },
    xAxis: {
      type: 'datetime',
      tickPixelInterval: 150
    },
    yAxis: [{
      labels: {
        formatter: function() {
              return this.value +'cps';
        },
        style: {
              color: '#DDD'}
      },
      title: {
        text: 'Commands per Second'
      },
    }, {
      gridLineWidth: 0,
      labels: {
        formatter: function() {
              return bytesToHuman(this.value);
        },
        style: {
              color: '#DDD'}
      },
      title: {
        text: "Memory Used"
      },
      opposite: true
    }
           ],
    tooltip: {
      formatter: function() {
        return '<b>'+ this.series.name +'</b><br/>'+
          Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x)
          +'<br/>'+
          Highcharts.numberFormat(this.y, 2);
      }
    },
    legend: {
      enabled: true
    },
    exporting: {
      enabled: false
    },
    series: [{
      name: 'Commands Processed Per Second',
      id: "cps",
      data: initPoints(num_of_points)
    }, {
      name: "Memory used",
      id: "mem",
      yAxis: 1,
      data: initPoints(num_of_points)
    }],
    plotOptions: {
      series: {
        marker: {
          enabled: false,
          states: {
            hover: {
              enabled: true,
              radius: 5}}

        },
        lineWidth: 1
      }
    }
  });


  var socket = io.connect();

  socket.on('update', function (data) {
    plot(data);
    updateTable(data);
  });
  var last_server_timestamp = 0, last_commands_processed = 0;
var cps_series = chart.get("cps"),
mem_series = chart.get("mem"),
mem_peak_series = chart.get("mem_peak");

var firstPoint = true;
function plot(data){
  var commands_processed = parseInt(data["total_commands_processed"]);
  var delta_secs = data.server_timestamp - last_server_timestamp;
  var delta_commands = commands_processed - last_commands_processed;
  var throughput = delta_commands / delta_secs;
  last_server_timestamp = data.server_timestamp;
  last_commands_processed = commands_processed;
  if (firstPoint) {
    firstPoint = false;
    return;
  }

  var mem_used = parseInt(data["used_memory"]);
  if (cps_series.data.length < num_of_points){
    cps_series.addPoint([data.server_timestamp * 1000, throughput], true, false);
    mem_series.addPoint([data.server_timestamp * 1000, mem_used], true, false);
  } else {
    cps_series.addPoint([data.server_timestamp * 1000, throughput], true, true);
    mem_series.addPoint([data.server_timestamp * 1000, mem_used], true, true);
  }

}
function updateTable(data){
  var tbody = "";
  for (var k in data) {
    tbody += "<tr><td>" + k + "</td><td>" + data[k] + "</td></tr>";
  }
  $("#info tbody").html(tbody);
}
});


function bytesToHuman(bytes){
  if (bytes < 1024){
    return bytes + "B";
  } else if (bytes < (1024*1024)){
    bytes = (bytes/1024).toFixed(2);
    return bytes + "K";
  } else if (bytes < (1024*1024*1024)) {
    bytes = (bytes/(1024*1024)).toFixed(2);
    return bytes + "M";
  } else {
    bytes = (bytes/(1024*1024*1024)).toFixed(2);
    return bytes + "G";
  }
}

function initPoints(num) {
  var points = [];
  var now = (new Date()).getTime();
  for (var i = now-num*1000; i < now; i+=1000) {
      points.push([i,0]);
  }
  return points;
}
