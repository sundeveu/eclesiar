Function Get-EclesiarScripts {
    Param(
        [string] $BaseUrl = 'https://24na7.info/eclesiar-scripts/'
    )
    $fItems = @(
        [pscustomobject]@{Name='Auctions';              Enabled = $True;    Path = $BaseUrl + 'Eclesiar%20Market%20&%20Auctions.user.js';                   Downloaded = $False;    ExistingMD5 = ''; DownloadedMD5 = ''},
        [pscustomobject]@{Name='Additions';             Enabled = $True;    Path = $BaseUrl + 'Eclesiar%20Misc%20Additions.user.js';                        Downloaded = $False;    ExistingMD5 = ''; DownloadedMD5 = ''},
        [pscustomobject]@{Name='TrainingCenter';        Enabled = $True;    Path = $BaseUrl + 'Eclesiar%20Training%20Center.user.js';                       Downloaded = $False;    ExistingMD5 = ''; DownloadedMD5 = ''},
        [pscustomobject]@{Name='MerchandAssistant';     Enabled = $True;    Path = $BaseUrl + 'Eclesiar_Januszex_Assistant_by_p0tfur.user.js';              Downloaded = $False;    ExistingMD5 = ''; DownloadedMD5 = ''},
        [pscustomobject]@{Name='Companies';             Enabled = $True;    Path = $BaseUrl + 'companies.user.js';                                          Downloaded = $False;    ExistingMD5 = ''; DownloadedMD5 = ''},
        [pscustomobject]@{Name='Holdings';              Enabled = $True;    Path = $BaseUrl + 'holdings.user.js';                                           Downloaded = $False;    ExistingMD5 = ''; DownloadedMD5 = ''},
        [pscustomobject]@{Name='NpcWorkersExport';      Enabled = $True;    Path = $BaseUrl + 'Eclesiar_NPC_Workers_Export.user.js';                        Downloaded = $False;    ExistingMD5 = ''; DownloadedMD5 = ''},
        [pscustomobject]@{Name='NpcRegionExport';       Enabled = $True;    Path = $BaseUrl + 'Eclesiar_Region_NPC_Export.user.js';                         Downloaded = $False;    ExistingMD5 = ''; DownloadedMD5 = ''},
        [pscustomobject]@{Name='ProfileHover';          Enabled = $True;    Path = 'https://cdn.nekobot.pl/scripts/Eclesiar_Profile_Hover_Card.user.js';    Downloaded = $False;    ExistingMD5 = ''; DownloadedMD5 = ''}
    )
    $fTargetPath = (Resolve-Path -Path '.\src').Path
    $fBackupPath = $fTargetPath + '\backup-' + (Get-Date -format "yyyyMMdd_HHmmss")
    $fItems | ForEach {
        $fName = $_.Name
        $fEnabled = $_.Enabled
        $fPath = $_.Path
        $fUpdated = $False
        If ($fEnabled) {
            If (Test-Path -Path "$($fTargetPath)\$($fName).js") {
                $_.ExistingMD5 = (Get-FileHash -Path "$($fTargetPath)\$($fName).js" -Algorithm 'MD5').Hash
            }
            Invoke-WebRequest -Uri $fPath -OutFile "$($fTargetPath)\$($fName).tmp.js"
            If (Test-Path -Path "$($fTargetPath)\$($fName).tmp.js") {
                $_.DownloadedMD5 = (Get-FileHash -Path "$($fTargetPath)\$($fName).tmp.js" -Algorithm 'MD5').Hash
                $_.Downloaded = $True
            }
            If ($_.ExistingMD5 -ne $_.DownloadedMD5) {
                # Create backup
                If (!(Test-Path -Path "$($fBackupPath)")) {
                    New-Item -ItemType Directory -Path $fBackupPath -Force | Out-Null
                }
                Copy-Item -Path "$($fTargetPath)\$($fName).js" -Destination "$($fBackupPath)\"
                
                # Remove backuped version
                Remove-Item -Path "$($fTargetPath)\$($fName).js"
                
                # Rename downloaded to final name
                Rename-Item -Path "$($fTargetPath)\$($fName).tmp.js" -NewName "$($fName).js"
            } Else {
                # Delete downloaded file because is the same as previous one
                Remove-Item -Path "$($fTargetPath)\$($fName).tmp.js"
            }
        }
    }
    Return $fItems
}

Get-EclesiarScripts

