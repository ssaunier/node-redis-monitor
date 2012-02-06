  Highcharts.setOptions({
    global: {
      useUTC: false
    }
  });

var chart;
$(document).ready(function() {
  chart = new Highcharts.Chart({
    chart: {
      renderTo: 'container',
      defaultSeriesType: 'line',
      marginRight: 10,
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
              color: '#89A54E'}
      },
      title: {
        text: 'Commands Processed Per Second'
      }

    }, {
      gridLineWidth: 0,
      labels: {
        formatter: function() {
              return this.value +'MB';
        },
        style: {
              color: '#AA4643'}
      },
      title: {
        text: "Memory Used",
        style: {
          color: '#AA4643'}
      }
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
      id: "cps"
    }, {
      name: "Memory used",
      id: "mem",
      yAxis: 1
    }, {
      name: "Memory used peak",
      id: "mem_peak",
      yAxis: 1
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
  
  var cps_series = chart.get("cps"), 
  mem_series = chart.get("mem"), 
  mem_peak_series = chart.get("mem_peak");

  var socket = io.connect();
  var last_server_time = 0, last_commands_processed = 0;
  socket.on('update', function (data) {
    var server_time = parseInt(data["server_time"]);
    var commands_processed = parseInt(data["total_commands_processed"]);
    var delta_secs = (server_time - last_server_time)/1000000;
    var delta_commands = commands_processed - last_commands_processed;
    var throughput = delta_commands / delta_secs;
    last_server_time = server_time;
    last_commands_processed = commands_processed;

    var mem_used = parseInt(data["used_memory_human"]);
    var mem_peak = parseInt(data["used_memory_peak_human"]);
    var now = (new Date()).getTime();
    if (cps_series.data.length < 300){
      cps_series.addPoint([now, throughput], true, false);
      mem_series.addPoint([now, mem_used], true, false);
      mem_peak_series.addPoint([now, mem_peak], true, false);
    } else {
      cps_series.addPoint([now, throughput], true, true);
      mem_series.addPoint([now, mem_used], true, true);
      mem_peak_series.addPoint([now, mem_peak], true, true);
    }

  });
  
});
   
