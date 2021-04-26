{ pkgs ? import <nixpkgs> {} }:
with pkgs;

rustPlatform.buildRustPackage rec {
  name = "basicweb-app-tasks-${version}";
  version = "0.0.1";
  src = ./.;
  nativeBuildInputs = [ diesel-cli ]; 
  buildInputs = [ openssl sqlite ];

  checkPhase = "";
  cargoSha256 = "sha256:1bg00s7m6misn3shgj805dn5ly94ikfd2qyd86kpw3qhmx7lih0i";

  meta = with stdenv.lib; {
    description = "Basic actix deployment";
    maintainers = [ maintainers.tailhook ];
    platforms = platforms.all;
  };
  
  postInstall = ''
    cp -rf $src/static $out/static
    echo "[basicweb-app-tasks] Running database migrations"
    mkdir $out/data
    ${diesel-cli}/bin/diesel migration \
      --database-url $out/data/database.sqlite \
      --migration-dir $src/migrations run
  '';
}
