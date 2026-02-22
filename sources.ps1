Function Get-EclesiarScripts {
    Param(
        [string] $BaseUrl = 'https://24na7.info/eclesiar-scripts/'
    )
    $fItems = @(
        [pscustomobject]@{Name='Auctions';              Enabled = $True;    Path = $gBaseUrl + 'Eclesiar%20Market%20&%20Auctions.user.js';          Downloaded = $False},
        [pscustomobject]@{Name='Additions';             Enabled = $True;    Path = $gBaseUrl + 'Eclesiar%20Misc%20Additions.user.js';               Downloaded = $False},
        [pscustomobject]@{Name='TrainingCenter';        Enabled = $True;    Path = $gBaseUrl + 'Eclesiar%20Training%20Center.user.js';              Downloaded = $False},
        [pscustomobject]@{Name='MerchandAssistant';     Enabled = $True;    Path = $gBaseUrl + 'Eclesiar_Januszex_Assistant_by_p0tfur.user.js';     Downloaded = $False},
        [pscustomobject]@{Name='Companies';             Enabled = $True;    Path = $gBaseUrl + 'companies.user.js';                                 Downloaded = $False},
        [pscustomobject]@{Name='Holdings';              Enabled = $True;    Path = $gBaseUrl + 'holdings.user.js';                                  Downloaded = $False},
        [pscustomobject]@{Name='NpcWorkersExport';      Enabled = $True;    Path = $gBaseUrl + 'Eclesiar_NPC_Workers_Export.user.js';               Downloaded = $False},
        [pscustomobject]@{Name='NpcRegionExport';       Enabled = $True;    Path = $gBaseUrl + 'Eclesiar_Region_NPC_Export.user.js';                Downloaded = $False}
    )
    $fItems | ForEach {
        $fName = $_.Name
        $fEnabled = $_.Enabled
        $fPath = $_.Path
        If ($fEnabled) {
            Invoke-WebRequest -Uri $fPath -OutFile ".\src\$($fName).js"
            If (Test-Path -Path ".\src\$($fName).js") {
                $_.Downloaded = $True
            }
        }
    }
    Return $fItems
}

Get-EclesiarScripts

