//////////////////
// Guess filter //
//////////////////

// Build the multiline codec pattern
function buildMultilineCodec(multiline_start_pattern) {
    codec = "multiline {\n"
    codec += "  pattern => \"" + multiline_start_pattern + "\"\n"
    codec += "  what => \"previous\"\n"
    codec += "  negate => \"true\"\n"
    codec += "}"
    return codec
}

// Build the filter guessed
function buildGuessedFilter(configuration) {

    mappings = {}

    for (field in configuration.mappings) {
        fieldMapping = configuration.mappings[field].type;
        if (fieldMapping == "long") {
            mappings[field] = "integer"
        } else if (fieldMapping == "double") {
            mappings[field] = "float"
        }
    }

    filter = "filter {\n\n"
    filter += "  grok {\n"
    filter += "    match => {\n"
    filter += "      \"message\" => \"" + configuration.grok_pattern + "\"\n"
    filter += "    }\n"
    filter += "  }\n\n"

    if ("timestamp_field" in configuration && "joda_timestamp_formats" in configuration) {
        filter += "  date {\n"
        filter += "    target => \"TIMESTAMP\"\n"
        filter += "    match => [\"" + configuration.timestamp_field + "\", \"" + configuration.joda_timestamp_formats[0] + "\"]\n"
        filter += "    remove_field => [\"" + configuration.timestamp_field + "\"]\n"
        filter += "  }\n\n"
    }

    if (Object.keys(mappings).length != 0) {
        filter += "  mutate {\n"
        filter += "    convert => {\n"
        for (field in mappings) {
            filter += "      \"" + field + "\" => \"" + mappings[field] + "\"\n"
        }
        filter += "    }\n"
        filter += "  }\n\n"
    }

    filter += "}\n"

    return filter
}

// Launch the guess process
function tryToGuessFilter() {
    body = {}
    if (remote_file_hash == undefined) {
        body.input_data = inputEditor.getValue()
    } else {
        body.filehash = remote_file_hash
    }

    $.ajax({
        url: api_url + "/guess_config",
        type: "POST",
        data: JSON.stringify(body),
        contentType: "application/json",
        dataType: "json",
        success: function (data) {
            if(data.succeed) {
                configuration = data.configuration

                filter = buildGuessedFilter(configuration)
                editor.setValue(filter, -1);

                multilineCodec = buildMultilineCodec(configuration.multiline_start_pattern)
                enableMultilineCodec(multilineCodec)

                var notif =  toastr.success('Guess of a Logstash configuration is done !', 'Success')
                redirectToastrClick(notif, "logstash_filter_textarea")
            } else {
                toastr.error('Unable to guess a Logstash configuration for this log file', 'Error')
            }
            
        },
        error: function () {
            jobFailed()
        }
    });
}

// Set a trigger on click on guess
$('#guess_filter').click(tryToGuessFilter);
