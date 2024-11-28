const core = require("@actions/core");
const { COLORS } = require("./colors");
const Table = require("cli-table3");
const { getTotalMaxScore, getTestWeight, getTestScore, totalPercentageReducer, getMaxScoreForTest } = require("./helpers/test-helpers");

function getTableTotals(runnerResults, pushToTable) {
  const totalMaxScore = getTotalMaxScore(runnerResults);

  return runnerResults.map(({ runner, results }) => {
    const maxScore = getMaxScoreForTest(results);
    // const weight = getTestWeight(maxScore, totalMaxScore);
    const score = getTestScore(results);
    const testName = runner.trim();

    pushToTable([testName, score, maxScore]);

    return {
      score,
      maxScore,
    };
  });
}

function AggregateResults(runnerResults) {
  try {
    const table = new Table({
      head: ["Test Runner Name", "Test Score", "Max Score"],
      colWidths: [20, 13, 13],
    });

    const totals = getTableTotals(runnerResults, (row) => table.push(row));

    // const totalPercent = totals.reduce(totalPercentageReducer, 0).toFixed(2) + "%";
    const totalTestScores = totals.reduce((acc, curr) => acc + curr.score, 0)
    const totalMaxScores = totals.reduce((acc, curr) => acc + curr.maxScore, 0)

    table.push(["Total: ", `${totalTestScores}`, `${totalMaxScores}`]);
    
    console.log(table.toString());

    // Set number of points
    if (totalMaxScores > 0) {
      core.setOutput('Points', `${totalTestScores}/${totalMaxScores}`);
    }
  } catch (error) {
    throw new Error(error.message);
  }
}

exports.AggregateResults = AggregateResults;
exports.getTableTotals = getTableTotals;
