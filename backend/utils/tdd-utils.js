// Clean the output generated by the logstash-filter-verifier, to allow him to match
// 'classical' log output, and provide tests-cases
function cleanTDDOutput(stdout) {

    var testBlocks = stdout.split("\nComparing message")

    if (testBlocks.length != 0 && testBlocks[0].match("^Running tests in")) {
        testBlocks.shift()
    }

    var recreatedLog = ""
    var testsCases = []

    for(var i=0 ; i < testBlocks.length ; i++) {
        var res = testBlocks[i].split("}\n{")
        if (res.length == 2) {
            var expected = res[0] + " }"
            var real = "{" + res[1]
            expected = expected.replace(/(\r\n|\n|\r)/gm, " ").replace(/^[^{]+/g, "").trim()
            real = real.replace(/(\r\n|\n|\r)/gm, " ").replace(/^[^{]+/g, "").trim()

            testsCases.push({
                "expected": expected,
                "real": real
            })
            recreatedLog += real + "\n"
        }
    }

    if(recreatedLog.endsWith("\n")) {
        recreatedLog = recreatedLog.slice(0, -1)
    }

    return [recreatedLog, testsCases]
}

module.exports = {
    cleanTDDOutput: cleanTDDOutput
};
