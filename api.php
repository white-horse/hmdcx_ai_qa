<?php

header('Content-Type: application/json');

// 检查请求方法
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => '只接受POST请求']);
    exit;
}

// 获取用户问题
$question = $_POST['question'] ?? '';
if (empty($question)) {
    echo json_encode(['error' => '问题不能为空']);
    exit;
}

// 调用DeepSeek API
$answer = getDeepSeekResponse($question);

// 返回响应
echo json_encode(['answer' => $answer]);

/**
 * 调用DeepSeek API获取回答
 */
function getDeepSeekResponse($question)
{
    // DeepSeek API端点 (示例，实际使用时需要替换为正确的API)
    $apiUrl = 'https://api.deepseek.com/v1/chat/completions';

    // API密钥 (需要申请)
    $apiKey = 'your_api_key_here'; // 替换为实际的API密钥

    // 准备请求数据
    $data = [
        'model'       => 'deepseek-v1',
        'messages'    => [
            ['role' => 'system', 'content' => '你是一个有帮助的AI助手。'],
            ['role' => 'user', 'content' => $question],
        ],
        'temperature' => 0.7,
        'max_tokens'  => 1000,
    ];

    // 初始化cURL
    $ch = curl_init($apiUrl);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiKey,
    ]);

    // 执行请求
    $response = curl_exec($ch);

    if (curl_errno($ch)) {
        return '请求API时出错: ' . curl_error($ch);
    }

    curl_close($ch);

    // 解析响应
    $responseData = json_decode($response, true);

    if (isset($responseData['choices']['message']['content'])) {
        return $responseData['choices']['message']['content'];
    } else {
        return '无法解析API响应: ' . $response;
    }
}
