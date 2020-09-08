{ pkgs ? import <nixpkgs> {} }:
with pkgs;

rustPlatform.buildRustPackage rec {
  name = "basicweb-app-gallery-${version}";
  version = "0.0.1";
  src = builtins.fetchGit {
      url = ./.;
      ref = "master";
    };
  nativeBuildInputs = [ diesel-cli ]; 
  buildInputs = [ openssl sqlite ];

  checkPhase = "";
  cargoSha256 = "sha256:0wnw9q8iqh92d8zpr70cq5zn5vm6rhjc5i0hpvm0a4zpzwf8d766";

  meta = with stdenv.lib; {
    description = "Basic actix deployment";
    maintainers = [ maintainers.tailhook ];
    platforms = platforms.all;
  };
  
  postInstall = ''
    cp -rf $src/static $out/static
    echo "[basicweb-app-gallery] Running database migrations"
    mkdir $out/data
    mkdir $out/data/assets
    ${diesel-cli}/bin/diesel migration \
      --database-url $out/data/database.sqlite \
      --migration-dir $src/migrations run
  '';
}
