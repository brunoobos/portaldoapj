<?php
header("Content-Type: application/json");

// Configuração do PostgreSQL
$host = "postgres.railway.internal";
$port = "5432";
$dbname = "railway";
$user = "postgres";
$password = "FsQGXBygMtASCnqAvgHEOwOXhRndTWVB";

// Criar conexão PDO
$dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
try {
    $pdo = new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (Exception $e) {
    echo json_encode(["erro" => "Falha na conexão: " . $e->getMessage()]);
    exit;
}

// Ler requisição
$input = json_decode(file_get_contents("php://input"), true);
$acao = $_GET['acao'] ?? '';

if ($acao === 'salvar') {
    // Salva tudo em uma nova linha na tabela
    $stmt = $pdo->prepare("INSERT INTO escala24x96 (equipes, afastamentos, feriados, observacoes, tarefas) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([
        json_encode($input['equipes']),
        json_encode($input['afastamentos']),
        json_encode($input['feriados']),
        json_encode($input['observacoes']),
        json_encode($input['tarefas'])
    ]);
    echo json_encode(["status" => "ok", "mensagem" => "Dados salvos"]);
}
elseif ($acao === 'carregar') {
    // Busca o último registro salvo
    $stmt = $pdo->query("SELECT * FROM escala24x96 ORDER BY id DESC LIMIT 1");
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($data ?: []);
}
else {
    echo json_encode(["erro" => "Ação não especificada"]);
}
?>
