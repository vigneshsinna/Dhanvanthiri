<?php

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;
use App\Modules\CartCheckout\Http\Requests\AddressRequest;

/**
 * AddressRequest validation: verifies backend expects line1/line2 (not line_1/line_2)
 * Bug 11: Frontend was sending line_1/line_2 but backend expects line1/line2
 */
class AddressRequestTest extends TestCase
{
    private function rules(): array
    {
        return (new AddressRequest())->rules();
    }

    public function test_rules_contain_line1_field(): void
    {
        $rules = $this->rules();
        $this->assertArrayHasKey('line1', $rules, 'Backend must validate line1 (not line_1)');
    }

    public function test_rules_contain_line2_field(): void
    {
        $rules = $this->rules();
        $this->assertArrayHasKey('line2', $rules, 'Backend must validate line2 (not line_2)');
    }

    public function test_rules_do_not_contain_line_1_underscore(): void
    {
        $rules = $this->rules();
        $this->assertArrayNotHasKey('line_1', $rules, 'Backend must NOT accept line_1');
    }

    public function test_rules_do_not_contain_line_2_underscore(): void
    {
        $rules = $this->rules();
        $this->assertArrayNotHasKey('line_2', $rules, 'Backend must NOT accept line_2');
    }

    public function test_line1_is_required(): void
    {
        $rules = $this->rules();
        $this->assertStringContainsString('required', $rules['line1']);
    }

    public function test_line2_is_nullable(): void
    {
        $rules = $this->rules();
        $this->assertStringContainsString('nullable', $rules['line2']);
    }

    public function test_recipient_name_is_required(): void
    {
        $rules = $this->rules();
        $this->assertArrayHasKey('recipient_name', $rules);
        $this->assertStringContainsString('required', $rules['recipient_name']);
    }

    public function test_country_code_is_exactly_2_chars(): void
    {
        $rules = $this->rules();
        $this->assertStringContainsString('size:2', $rules['country_code']);
    }

    public function test_all_required_fields_present(): void
    {
        $rules = $this->rules();
        $required = ['recipient_name', 'phone', 'line1', 'city', 'state', 'postal_code', 'country_code'];
        foreach ($required as $field) {
            $this->assertArrayHasKey($field, $rules, "Rule for {$field} must exist");
        }
    }
}
